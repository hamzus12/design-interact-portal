
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const fetchJobs = async () => {
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
  };

  const fetchJobsByFilters = async (filters: any) => {
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
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <DatabaseContext.Provider value={{ jobs, loading, error, fetchJobs, fetchJobsByFilters }}>
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
