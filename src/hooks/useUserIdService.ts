import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userIdService } from '@/services/UserIdService';

export const useUserIdService = () => {
  const { user } = useAuth();
  const [databaseUserId, setDatabaseUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatabaseUserId = async () => {
      if (!user?.id) {
        setDatabaseUserId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const dbUserId = await userIdService.getUserDatabaseId(user.id);
        setDatabaseUserId(dbUserId);
      } catch (err) {
        console.error('Error fetching database user ID:', err);
        setError('Failed to fetch user profile');
        setDatabaseUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseUserId();
  }, [user?.id]);

  return { databaseUserId, loading, error };
};