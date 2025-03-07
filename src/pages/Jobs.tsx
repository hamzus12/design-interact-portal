
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import FilterSection from '@/components/Jobs/FilterSection';
import JobCard from '@/components/Jobs/JobCard';
import { useDatabase } from '@/context/DatabaseContext';
import { useUserRole } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Jobs = () => {
  const { jobs, loading, error, fetchJobs, fetchJobsByFilters, favorites, toggleFavorite } = useDatabase();
  const { user, role } = useUserRole();
  const [filters, setFilters] = useState({
    keyword: '',
    category: [],
    jobType: [],
    location: []
  });

  useEffect(() => {
    // Load all jobs on initial page load
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchJobsByFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: [],
      jobType: [],
      location: []
    });
    fetchJobs();
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold sm:text-3xl">Browse Jobs</h1>
            
            {user && (role === 'recruiter' || role === 'admin') && (
              <Button asChild className="bg-primary text-white">
                <Link to="/add-job">
                  <Plus className="mr-2 h-4 w-4" /> Post a Job
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <FilterSection
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
            
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  {error}
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      isFavorite={favorites.includes(job.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-white p-8 text-center shadow">
                  <h3 className="text-lg font-semibold">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
