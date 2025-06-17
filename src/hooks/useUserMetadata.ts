
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook personnalisé pour gérer les métadonnées utilisateur Supabase
 */
export function useUserMetadata() {
  const { user, loading: authLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Définir isLoaded basé sur le statut d'authentification
  useEffect(() => {
    if (!authLoading) {
      setIsLoaded(true);
    }
  }, [authLoading]);

  /**
   * Mettre à jour les métadonnées utilisateur avec gestion automatique des erreurs
   */
  const updateMetadata = useCallback(async (
    metadata: Record<string, any>,
    options?: {
      showSuccessToast?: boolean;
      successMessage?: string;
    }
  ) => {
    if (!isLoaded || !user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté ou non chargé",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      setIsUpdating(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...metadata
        }
      });
      
      if (error) throw error;
      
      if (options?.showSuccessToast !== false) {
        toast({
          title: "Succès",
          description: options?.successMessage || "Profil utilisateur mis à jour avec succès"
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des métadonnées utilisateur:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les métadonnées utilisateur",
        variant: "destructive"
      });
      
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  }, [isLoaded, user]);

  /**
   * Récupérer une valeur des métadonnées utilisateur
   */
  const getMetadata = useCallback((key: string, defaultValue: any = null) => {
    if (!isLoaded || !user) return defaultValue;
    return user.user_metadata?.[key] ?? defaultValue;
  }, [isLoaded, user]);

  /**
   * Vérifier si l'utilisateur a déjà créé un JobPersona
   */
  const hasJobPersona = useCallback(() => {
    return getMetadata('has_job_persona', false);
  }, [getMetadata]);

  /**
   * Récupérer les données JobPersona
   */
  const getJobPersona = useCallback(() => {
    return getMetadata('job_persona', null);
  }, [getMetadata]);

  /**
   * Récupérer le rôle de l'utilisateur
   */
  const getUserRole = useCallback(() => {
    return getMetadata('role', 'candidate');
  }, [getMetadata]);

  /**
   * Vérifier si l'utilisateur est un candidat
   */
  const isCandidate = useCallback(() => {
    return getUserRole() === 'candidate';
  }, [getUserRole]);

  /**
   * Vérifier si l'utilisateur est un recruteur
   */
  const isRecruiter = useCallback(() => {
    return getUserRole() === 'recruiter';
  }, [getUserRole]);

  /**
   * Vérifier si l'utilisateur est un admin
   */
  const isAdmin = useCallback(() => {
    return getUserRole() === 'admin';
  }, [getUserRole]);

  return {
    updateMetadata,
    getMetadata,
    hasJobPersona,
    getJobPersona,
    getUserRole,
    isCandidate,
    isRecruiter,
    isAdmin,
    isUpdating,
    isLoaded
  };
}
