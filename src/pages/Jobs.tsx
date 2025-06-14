
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import FilterSection from '@/components/Jobs/FilterSection';
import JobCard from '@/components/Jobs/JobCard';
import { useDatabase } from '@/context/DatabaseContext';
import { useUserRole } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Job } from '@/types/Job';

const Jobs = () => {
  const { jobs, loading, error, fetchJobs, fetchJobsByFilters, favorites, toggleFavorite } = useDatabase();
  const { user, role } = useUserRole();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    keyword: '',
    category: [],
    jobType: [],
    location: []
  });
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  useEffect(() => {
    // Load all jobs on initial page load
    fetchJobs();
    
    // Try to get user's geolocation if browser supports it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          // This would typically use a reverse geocoding service
          // For now, we'll just show coordinates
          setCurrentLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
          toast({
            title: "Location detected",
            description: "We can show you local job opportunities",
          });
        },
        error => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, [fetchJobs, toast]);

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
      <div className="bg-gray-50 py-8 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl dark:text-white">Browse Jobs</h1>
              {currentLocation && (
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>Your location: {currentLocation}</span>
                </div>
              )}
            </div>
            
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
                <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job: Job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      isFavorite={favorites.includes(job.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800 dark:text-gray-200">
                  <h3 className="text-lg font-semibold">No jobs found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search filters.</p>
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
