
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Hook personnalisé pour les opérations Supabase avec gestion des états de chargement et d'erreur
 */
export function useSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null, error: PostgrestError | null }>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showSuccessToast?: boolean; 
      showErrorToast?: boolean;
    }
  ) => {
    const {
      loadingMessage = "Chargement en cours...",
      successMessage,
      errorMessage = "Une erreur s'est produite lors de l'opération",
      showSuccessToast = false,
      showErrorToast = true
    } = options || {};
    
    try {
      setLoading(true);
      setError(null);
      
      if (loadingMessage && showSuccessToast) {
        toast({
          title: "Chargement",
          description: loadingMessage,
        });
      }
      
      const { data, error } = await queryFn();
      
      if (error) {
        const errorMsg = handleSupabaseError(error, errorMessage);
        setError(errorMsg);
        
        if (showErrorToast) {
          toast({
            title: "Erreur",
            description: errorMsg,
            variant: "destructive",
          });
        }
        
        return { data: null, error: errorMsg };
      }
      
      if (successMessage && showSuccessToast) {
        toast({
          title: "Succès",
          description: successMessage,
        });
      }
      
      return { data, error: null };
    } catch (err: any) {
      const errorMsg = err.message || errorMessage;
      setError(errorMsg);
      
      if (showErrorToast) {
        toast({
          title: "Erreur",
          description: errorMsg,
          variant: "destructive",
        });
      }
      
      return { data: null, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    executeQuery,
  };
}

// Fonction utilitaire pour créer des opérations communes sur les tables
export function createSupabaseOperations<T>(table: string) {
  const { executeQuery } = useSupabase();
  
  return {
    getById: (id: string | number) => 
      executeQuery<T>(() => {
        return new Promise((resolve) => {
          supabase.from(table).select('*').eq('id', id).maybeSingle()
            .then(result => resolve({ 
              data: result.data as T | null, 
              error: result.error 
            }));
        });
      }, {
        errorMessage: `Impossible de récupérer l'élément avec l'ID ${id}`
      }),
    
    getAll: (options?: { limit?: number, order?: { column: string, ascending?: boolean } }) => 
      executeQuery<T[]>(() => {
        return new Promise((resolve) => {
          let query = supabase.from(table).select('*');
          
          if (options?.order) {
            query = query.order(
              options.order.column, 
              { ascending: options.order.ascending ?? true }
            );
          }
          
          if (options?.limit) {
            query = query.limit(options.limit);
          }
          
          query.then(result => resolve({ 
            data: result.data as T[] | null, 
            error: result.error 
          }));
        });
      }, {
        errorMessage: `Impossible de récupérer les données de la table ${table}`
      }),
    
    create: (data: Partial<T>, options?: { successMessage?: string }) => 
      executeQuery<T>(() => {
        return new Promise((resolve) => {
          supabase.from(table).insert(data).select().single()
            .then(result => resolve({ 
              data: result.data as T | null, 
              error: result.error 
            }));
        });
      }, { 
        successMessage: options?.successMessage || "Élément créé avec succès",
        showSuccessToast: true,
        errorMessage: "Impossible de créer l'élément"
      }),
    
    update: (id: string | number, data: Partial<T>, options?: { successMessage?: string }) => 
      executeQuery<T>(() => {
        return new Promise((resolve) => {
          supabase.from(table).update(data).eq('id', id).select().single()
            .then(result => resolve({ 
              data: result.data as T | null, 
              error: result.error 
            }));
        });
      }, {
        successMessage: options?.successMessage || "Élément mis à jour avec succès",
        showSuccessToast: true,
        errorMessage: "Impossible de mettre à jour l'élément"
      }),
    
    delete: (id: string | number, options?: { successMessage?: string }) => 
      executeQuery<null>(() => {
        return new Promise((resolve) => {
          supabase.from(table).delete().eq('id', id)
            .then(result => resolve({ 
              data: null, 
              error: result.error 
            }));
        });
      }, {
        successMessage: options?.successMessage || "Élément supprimé avec succès",
        showSuccessToast: true,
        errorMessage: "Impossible de supprimer l'élément"
      }),
  };
}
