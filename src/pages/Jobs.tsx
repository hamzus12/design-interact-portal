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

// Sample job data
const jobsData = [
  {
    id: 1,
    title: 'Post-Room Operate',
    company: 'Teast Design LTD',
    companyLogo: 'V',
    location: 'Wadesley Rd, London',
    category: 'Accountancy',
    type: 'Freelance',
    timeAgo: '1 Hr Ago',
    featured: true,
    logoColor: 'bg-green-500',
    jobType: 'Full Time',
  },
  {
    id: 2,
    title: 'Data Entry',
    company: 'Techno Inc.',
    companyLogo: 'T',
    location: 'Street 45A, London',
    category: 'Data Entry',
    type: 'Freelance',
    timeAgo: '3 Hr Ago',
    featured: false,
    logoColor: 'bg-red',
    jobType: 'Part Time',
  },
  {
    id: 3,
    title: 'Graphic Designer',
    company: 'Dewen Design',
    companyLogo: 'U',
    location: 'West Sight, USA',
    category: 'Graphics',
    type: 'Freelance',
    timeAgo: '4 Hr Ago',
    featured: false,
    logoColor: 'bg-blue-500',
    jobType: 'Full Time',
  },
  {
    id: 4,
    title: 'Web Developer',
    company: 'MegaNews',
    companyLogo: 'M',
    location: 'San Francisco, California',
    category: 'Development',
    type: 'Freelance',
    timeAgo: '5 Hr Ago',
    featured: false,
    logoColor: 'bg-purple-500',
    jobType: 'Remote',
  },
  {
    id: 5,
    title: 'Digital Marketer',
    company: 'All Marketer LTD',
    companyLogo: 'A',
    location: 'Wadesley Rd, London',
    category: 'Marketing',
    type: 'Full Time',
    timeAgo: '6 Hr Ago',
    featured: false,
    logoColor: 'bg-pink-500',
    jobType: 'On Site',
  },
  {
    id: 6,
    title: 'UI/UX Designer',
    company: 'Design Master',
    companyLogo: 'D',
    location: 'Zac Rd, London',
    category: 'Accountancy',
    type: 'Part Time',
    timeAgo: '8 Hr Ago',
    featured: false,
    logoColor: 'bg-indigo-500', 
    jobType: 'Hybrid',
  },
  {
    id: 7,
    title: 'Senior React Developer',
    company: 'TechGrowth',
    companyLogo: 'T',
    location: 'Berlin, Germany',
    category: 'Development',
    type: 'Full Time',
    timeAgo: '10 Hr Ago',
    featured: true,
    logoColor: 'bg-green-500',
    jobType: 'Remote',
  },
  {
    id: 8,
    title: 'Content Writer',
    company: 'Media Group',
    companyLogo: 'M',
    location: 'Paris, France',
    category: 'Content',
    type: 'Contract',
    timeAgo: '12 Hr Ago',
    featured: false,
    logoColor: 'bg-yellow-500',
    jobType: 'Remote',
  },
];

const categories = [
  'Accountancy', 'Education', 'Automotive', 'Business', 
  'Healthcare', 'IT & Agency', 'Engineering', 'Legal'
];

const jobTypes = [
  'Full Time', 'Part Time', 'Remote', 'Contract', 'Internship'
];

const locations = [
  'London', 'New York', 'San Francisco', 'Berlin', 'Paris', 'Tokyo'
];

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
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Categories */}
                <div>
                  <h3 className="mb-3 font-semibold">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={filters.category.includes(category)}
                          onCheckedChange={() => toggleFilter('category', category)}
                          className="data-[state=checked]:bg-red data-[state=checked]:border-red"
                        />
                        <label htmlFor={`category-${category}`} className="ml-2 text-sm">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Job Types */}
                <div>
                  <h3 className="mb-3 font-semibold">Job Type</h3>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <div key={type} className="flex items-center">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={filters.jobType.includes(type)}
                          onCheckedChange={() => toggleFilter('jobType', type)}
                          className="data-[state=checked]:bg-red data-[state=checked]:border-red"
                        />
                        <label htmlFor={`type-${type}`} className="ml-2 text-sm">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Locations */}
                <div>
                  <h3 className="mb-3 font-semibold">Location</h3>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <div key={location} className="flex items-center">
                        <Checkbox 
                          id={`location-${location}`} 
                          checked={filters.location.includes(location)}
                          onCheckedChange={() => toggleFilter('location', location)}
                          className="data-[state=checked]:bg-red data-[state=checked]:border-red"
                        />
                        <label htmlFor={`location-${location}`} className="ml-2 text-sm">
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mr-2"
                >
                  Clear Filters
                </Button>
                <Button
                  className="bg-red text-white hover:bg-red/90"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
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
                    <div
                      key={job.id}
                      className="job-card overflow-hidden rounded-lg border border-gray-100 bg-white transition-all hover:border-red animate-fade-in"
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    >
                      <div className="bg-red-50 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${job.logoColor} text-white`}>
                              {job.companyLogo}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                <Link to={`/job/${job.id}`} className="hover:text-red transition-colors">
                                  {job.title}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-600">via {job.company}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleFavorite(job.id)}
                            className="rounded-full p-1 transition-colors hover:bg-gray-100"
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
                            <Badge variant="outline" className="border-red text-red">
                              {job.jobType}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="mb-3 flex items-center text-sm text-gray-600">
                          <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                          {job.location}
                        </div>
                        
                        <div className="mb-3 flex items-center text-sm text-gray-600">
                          <Building className="mr-1 h-4 w-4 text-gray-400" />
                          {job.category}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <Badge variant="secondary" className="font-normal">
                              {job.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="mr-1 h-4 w-4 text-gray-400" />
                            {job.timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
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
