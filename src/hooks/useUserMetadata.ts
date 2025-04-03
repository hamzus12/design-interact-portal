
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook for managing Supabase user metadata
 */
export function useUserMetadata() {
  const { user, loading: isLoaded } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Update user metadata with automatic error handling
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
        title: "Error",
        description: "User not loaded or not authenticated",
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
          title: "Success",
          description: options?.successMessage || "User profile updated successfully"
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user metadata:', error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update user metadata",
        variant: "destructive"
      });
      
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  }, [isLoaded, user, toast]);

  /**
   * Get a value from user metadata
   */
  const getMetadata = useCallback((key: string, defaultValue: any = null) => {
    if (!isLoaded || !user) return defaultValue;
    return user.user_metadata?.[key] ?? defaultValue;
  }, [isLoaded, user]);

  return {
    updateMetadata,
    getMetadata,
    isUpdating,
    isLoaded
  };
}
