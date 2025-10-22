import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type AppRole = 'admin' | 'recruiter' | 'candidate';

interface UserRole {
  role: AppRole;
  loading: boolean;
  isAdmin: boolean;
  isRecruiter: boolean;
  isCandidate: boolean;
}

/**
 * Hook sécurisé pour vérifier le rôle de l'utilisateur depuis Supabase
 */
export function useUserRole(): UserRole {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('candidate'); // Rôle par défaut
        } else if (data) {
          setRole(data.role as AppRole);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole('candidate');
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return {
    role: role || 'candidate',
    loading,
    isAdmin: role === 'admin',
    isRecruiter: role === 'recruiter',
    isCandidate: role === 'candidate' || !role,
  };
}
