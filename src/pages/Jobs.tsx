
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Building, 
  Clock, 
  Heart, 
  Filter, 
  ChevronDown 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDatabase } from '@/context/DatabaseContext';
import { Job } from '@/models/job';
import JobCard from '@/components/Jobs/JobCard';
import FilterSection from '@/components/Jobs/FilterSection';

// Helper function to get URL parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Jobs = () => {
  const query = useQuery();
  const initialKeyword = query.get('keyword') || '';
  const initialLocation = query.get('location') || '';
  
  const { jobs, loading, error, fetchJobsByFilters } = useDatabase();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    category: [] as string[],
    jobType: [] as string[],
    location: initialLocation ? [initialLocation] : [] as string[],
  });
  const [keyword, setKeyword] = useState(initialKeyword);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFavorite = (jobId: number) => {
    if (favorites.includes(jobId)) {
      setFavorites(favorites.filter(id => id !== jobId));
    } else {
      setFavorites([...favorites, jobId]);
    }
  };

  const toggleFilter = (type: 'category' | 'jobType' | 'location', value: string) => {
    setFilters(prev => {
      if (prev[type].includes(value)) {
        return {
          ...prev,
          [type]: prev[type].filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...prev[type], value]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      jobType: [],
      location: [],
    });
    setKeyword('');
  };

  useEffect(() => {
    // Initial load with URL parameters
    const urlFilters: any = {};
    
    if (initialKeyword) {
      urlFilters.keyword = initialKeyword;
    }
    
    if (initialLocation) {
      urlFilters.location = [initialLocation];
    }
    
    fetchJobsByFilters(urlFilters);
  }, [initialKeyword, initialLocation, fetchJobsByFilters]);

  const handleSearch = () => {
    const searchFilters: any = { ...filters };
    
    if (keyword) {
      searchFilters.keyword = keyword;
    }
    
    fetchJobsByFilters(searchFilters);
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 animate-fade-in">Browse Jobs</h1>
          
          {/* Search bar */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search jobs by keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline" 
                className="flex items-center space-x-2"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button onClick={handleSearch} className="bg-red text-white hover:bg-red/90">
                Search
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <FilterSection 
              filters={filters} 
              toggleFilter={toggleFilter} 
              clearFilters={clearFilters} 
              onApplyFilters={() => setShowFilters(false)} 
            />
          )}
          
          {/* Jobs grid */}
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-gray-100 bg-white p-6">
                    <div className="mb-4 flex items-center">
                      <div className="mr-3 h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="mb-4 h-3 w-1/4 rounded bg-gray-200"></div>
                    <div className="mb-3 h-3 w-full rounded bg-gray-200"></div>
                    <div className="mb-3 h-3 w-2/3 rounded bg-gray-200"></div>
                    <div className="flex justify-between">
                      <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                      <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-md">
                <p className="text-gray-600">Error loading jobs. Please try again.</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-md">
                <p className="text-gray-600">No jobs found matching your criteria.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-gray-600">Showing {jobs.length} jobs</p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job, index) => (
                    <JobCard 
                      key={job.id}
                      job={job}
                      index={index}
                      isFavorite={favorites.includes(job.id)}
                      onToggleFavorite={() => toggleFavorite(job.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
