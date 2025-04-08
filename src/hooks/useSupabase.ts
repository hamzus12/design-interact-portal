
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Custom hook for Supabase data operations with loading and error states
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
      loadingMessage,
      successMessage,
      errorMessage,
      showSuccessToast = false,
      showErrorToast = true
    } = options || {};
    
    try {
      setLoading(true);
      setError(null);
      
      if (loadingMessage) {
        toast({
          title: "Loading",
          description: loadingMessage,
        });
      }
      
      const { data, error } = await queryFn();
      
      if (error) {
        const errorMsg = handleSupabaseError(error, errorMessage || "Operation failed");
        setError(errorMsg);
        
        if (showErrorToast) {
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          });
        }
        
        return { data: null, error: errorMsg };
      }
      
      if (successMessage && showSuccessToast) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      return { data, error: null };
    } catch (err: any) {
      const errorMsg = err.message || errorMessage || "An unexpected error occurred";
      setError(errorMsg);
      
      if (showErrorToast) {
        toast({
          title: "Error",
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

// Utility function for creating common query operations
export function createSupabaseOperations<T>(table: string) {
  const { executeQuery } = useSupabase();
  
  return {
    getById: (id: string | number) => 
      executeQuery<T>(() => {
        return new Promise((resolve) => {
          supabase.from(table).select('*').eq('id', id).single()
            .then(result => resolve({ 
              data: result.data as T | null, 
              error: result.error 
            }));
        });
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
        successMessage: options?.successMessage || "Record created successfully",
        showSuccessToast: true
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
        successMessage: options?.successMessage || "Record updated successfully",
        showSuccessToast: true
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
        successMessage: options?.successMessage || "Record deleted successfully",
        showSuccessToast: true
      }),
  };
}
