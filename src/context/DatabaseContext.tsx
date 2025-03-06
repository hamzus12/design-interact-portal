
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '../models/job';
import { toast } from '@/components/ui/use-toast';

interface DatabaseContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchJobsByFilters: (filters: any) => Promise<void>;
  toggleFavorite: (jobId: number | string) => Promise<void>;
  favorites: (number | string)[];
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<(number | string)[]>([]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);
      
      if (supabaseError) throw supabaseError;
      
      // Transform the data to match our Job interface
      const transformedJobs: Job[] = data.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        companyLogo: job.company_logo || 'V', // Use first letter if no logo
        location: job.location,
        category: job.category,
        type: job.job_type,
        timeAgo: formatTimeAgo(job.created_at),
        featured: false, // You can determine this later
        logoColor: getRandomLogoColor(),
        jobType: job.job_type
      }));
      
      setJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobsByFilters = useCallback(async (filters: any) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);
      
      // Apply keyword filter (search in title and company)
      if (filters.keyword) {
        query = query.or(`title.ilike.%${filters.keyword}%,company.ilike.%${filters.keyword}%`);
      }
      
      // Apply category filter
      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category);
      }
      
      // Apply job type filter
      if (filters.jobType && filters.jobType.length > 0) {
        query = query.in('job_type', filters.jobType);
      }
      
      // Apply location filter
      if (filters.location && filters.location.length > 0) {
        const locationParam = filters.location[0];
        query = query.ilike('location', `%${locationParam}%`);
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) throw supabaseError;
      
      // Transform the data to match our Job interface
      const transformedJobs: Job[] = data.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        companyLogo: job.company_logo || 'V', // Use first letter if no logo
        location: job.location,
        category: job.category,
        type: job.job_type,
        timeAgo: formatTimeAgo(job.created_at),
        featured: false,
        logoColor: getRandomLogoColor(),
        jobType: job.job_type
      }));
      
      setJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching filtered jobs:', err);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        // User is not logged in, use local storage
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
        return;
      }
      
      // User is logged in, load from database
      const { data, error } = await supabase
        .from('bookmarks')
        .select('job_id');
        
      if (error) throw error;
      
      setFavorites(data.map(item => item.job_id));
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, []);

  const toggleFavorite = useCallback(async (jobId: number | string) => {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        // User is not logged in, use local storage
        const newFavorites = favorites.includes(jobId)
          ? favorites.filter(id => id !== jobId)
          : [...favorites, jobId];
          
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        toast({
          title: favorites.includes(jobId) ? "Removed from favorites" : "Added to favorites",
          description: "Please sign in to save your favorites permanently."
        });
        return;
      }
      
      // User is logged in, toggle in database
      if (favorites.includes(jobId)) {
        // Remove from favorites
        await supabase
          .from('bookmarks')
          .delete()
          .eq('job_id', jobId);
          
        setFavorites(favorites.filter(id => id !== jobId));
        toast({
          title: "Removed from favorites",
          description: "Job removed from your saved listings"
        });
      } else {
        // Add to favorites
        await supabase
          .from('bookmarks')
          .insert({ job_id: jobId });
          
        setFavorites([...favorites, jobId]);
        toast({
          title: "Added to favorites",
          description: "Job saved to your favorites"
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  }, [favorites]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs === 1) return '1 Hr Ago';
    if (diffHrs < 24) return `${diffHrs} Hrs Ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return '1 Day Ago';
    if (diffDays < 30) return `${diffDays} Days Ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 Month Ago';
    return `${diffMonths} Months Ago`;
  };

  // Helper function to generate random logo colors
  const getRandomLogoColor = () => {
    const colors = [
      'bg-red', 
      'bg-blue-500', 
      'bg-green-500', 
      'bg-purple-500', 
      'bg-yellow-500', 
      'bg-indigo-500', 
      'bg-pink-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchJobs();
    loadFavorites();
  }, [fetchJobs, loadFavorites]);

  // Use memoized value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    jobs,
    loading,
    error,
    fetchJobs,
    fetchJobsByFilters,
    toggleFavorite,
    favorites
  }), [jobs, loading, error, fetchJobs, fetchJobsByFilters, toggleFavorite, favorites]);

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
