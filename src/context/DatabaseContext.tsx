
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { Job } from '../models/job';
import { toast } from '@/components/ui/use-toast';
import { formatTimeAgo } from '@/utils/dateUtils';
import { useUserRole } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';

interface DatabaseContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchJobsByFilters: (filters: JobFilters) => Promise<void>;
  toggleFavorite: (jobId: number | string) => Promise<void>;
  favorites: (number | string)[];
}

export interface JobFilters {
  keyword?: string;
  category?: string[];
  jobType?: string[];
  location?: string[];
  page?: number;
  limit?: number;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Random logo colors for consistent job displays
const LOGO_COLORS = [
  'bg-blue-500', 
  'bg-green-500', 
  'bg-purple-500', 
  'bg-yellow-500', 
  'bg-indigo-500', 
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500'
];

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<(number | string)[]>([]);
  const { user } = useUserRole();
  const { user: authUser } = useAuth();

  // Transform job data from Supabase to our Job interface
  const transformJobData = useCallback((data: any[]): Job[] => {
    if (!data || data.length === 0) return [];
    
    console.log('Transforming job data:', data);
    
    return data.map((job, index) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      companyLogo: job.company_logo || job.company.charAt(0).toUpperCase(),
      location: job.location,
      category: job.category,
      type: job.job_type,
      timeAgo: formatTimeAgo(job.created_at),
      featured: Boolean(job.is_featured),
      logoColor: LOGO_COLORS[index % LOGO_COLORS.length], // Consistent color based on array position
      jobType: job.job_type,
      description: job.description,
      salaryRange: job.salary_range,
      recruiterId: job.recruiter_id,
      isActive: job.is_active
    }));
  }, []);

  // Fetch all active jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all active jobs');
      
      const { data, error: supabaseError } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        throw new Error(handleSupabaseError(supabaseError));
      }
      
      console.log('Jobs fetched:', data?.length || 0);
      setJobs(transformJobData(data || []));
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [transformJobData]);

  // Fetch jobs with filters
  const fetchJobsByFilters = useCallback(async (filters: JobFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching jobs with filters:', filters);
      
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);
      
      // Apply keyword filter (search in title, company and description)
      if (filters.keyword) {
        query = query.or(`title.ilike.%${filters.keyword}%,company.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
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
      
      // Apply pagination
      if (filters.limit) {
        const page = filters.page || 1;
        const from = (page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        
        query = query.range(from, to);
      }
      
      // Order by created_at descending
      query = query.order('created_at', { ascending: false });
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        throw new Error(handleSupabaseError(supabaseError));
      }
      
      console.log('Filtered jobs fetched:', data?.length || 0);
      setJobs(transformJobData(data || []));
    } catch (err: any) {
      console.error('Error fetching filtered jobs:', err);
      setError(err.message || 'Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [transformJobData]);

  // Load favorites from database or localStorage
  const loadFavorites = useCallback(async () => {
    try {
      if (!authUser?.id) {
        // User is not logged in, use local storage
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
        return;
      }
      
      console.log('Loading favorites for user:', authUser.id);
      
      // User is logged in, load from database
      const { data, error } = await supabase
        .from('bookmarks')
        .select('job_id')
        .eq('user_id', authUser.id);
        
      if (error) throw new Error(handleSupabaseError(error));
      
      console.log('Favorites loaded:', data.length);
      setFavorites(data.map(item => item.job_id));
    } catch (err: any) {
      console.error('Error loading favorites:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to load favorites",
        variant: "destructive"
      });
    }
  }, [authUser?.id]);

  // Toggle job favorite status
  const toggleFavorite = useCallback(async (jobId: number | string) => {
    try {
      if (!authUser?.id) {
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
      
      console.log(`Toggle favorite for job ID ${jobId} and user ID ${authUser.id}`);
      
      // User is logged in, toggle in database
      if (favorites.includes(jobId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('job_id', jobId)
          .eq('user_id', authUser.id);
          
        if (error) throw new Error(handleSupabaseError(error));
          
        setFavorites(favorites.filter(id => id !== jobId));
        
        toast({
          title: "Removed from favorites",
          description: "Job removed from your saved listings"
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('bookmarks')
          .insert({ job_id: jobId, user_id: authUser.id });
          
        if (error) throw new Error(handleSupabaseError(error));
          
        setFavorites([...favorites, jobId]);
        
        toast({
          title: "Added to favorites",
          description: "Job saved to your favorites"
        });
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  }, [favorites, authUser?.id]);

  // Initial fetch on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Load favorites when user changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, authUser?.id]);

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
