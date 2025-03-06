
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { getAllJobs, getJobsByFilters, Job } from '../models/job';

interface DatabaseContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchJobsByFilters: (filters: any) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await getAllJobs();
      setJobs(jobsData);
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
      const jobsData = await getJobsByFilters(filters);
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching filtered jobs:', err);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Use memoized value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    jobs,
    loading,
    error,
    fetchJobs,
    fetchJobsByFilters
  }), [jobs, loading, error, fetchJobs, fetchJobsByFilters]);

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
