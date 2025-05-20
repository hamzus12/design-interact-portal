
import React, { useState, useEffect } from 'react';
import { MapPin, Building, Clock, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import { Button } from '@/components/ui/button';

const JobsSection: React.FC = () => {
  const { jobs, loading, favorites, toggleFavorite, fetchJobs } = useDatabase();
  const [displayedJobs, setDisplayedJobs] = useState([]);

  useEffect(() => {
    // Fetch jobs when component mounts
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // Set displayed jobs to maximum 6 from fetched jobs
    setDisplayedJobs(jobs.slice(0, 6));
  }, [jobs]);

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl animate-fade-in dark:text-white">
            Jobs You May Be Interested In
          </h2>
          <p className="text-gray-600 animate-fade-in dark:text-gray-300" style={{ animationDelay: '0.1s' }}>
            Explore our curated selection of job openings across various industries and locations.
            Find opportunities that match your skills and career aspirations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : displayedJobs.length > 0 ? (
            displayedJobs.map((job, index) => (
              <div
                key={job.id}
                className="job-card overflow-hidden rounded-lg border border-gray-100 bg-white transition-all hover:border-red dark:bg-gray-800 dark:border-gray-700 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="bg-red-50 p-4 dark:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${job.logoColor} text-white`}>
                        {job.companyLogo}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          <Link to={`/job/${job.id}`} className="hover:text-red transition-colors">
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">via {job.company}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(job.id)}
                      className="rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={favorites.includes(job.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(job.id) ? 'fill-red text-red' : 'text-gray-400'
                        } transition-colors`}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {job.jobType && (
                    <div className="mb-3">
                      <Badge variant="outline" className="border-red text-red dark:border-red/70 dark:text-red/90">
                        {job.jobType}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mb-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                    {job.location}
                  </div>
                  
                  <div className="mb-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building className="mr-1 h-4 w-4 text-gray-400" />
                    {job.category}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <Badge variant="secondary" className="font-normal dark:bg-gray-700 dark:text-gray-300">
                        {job.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="mr-1 h-4 w-4 text-gray-400" />
                      {job.timeAgo}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold dark:text-white">No jobs available</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back soon for new opportunities.</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/jobs"
            className="inline-block rounded-md border border-red bg-white px-6 py-3 font-medium text-red transition-colors hover:bg-red hover:text-white animate-fade-in dark:bg-gray-800 dark:border-red/70 dark:hover:bg-red/90"
            style={{ animationDelay: '0.4s' }}
          >
            Browse All Jobs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobsSection;
