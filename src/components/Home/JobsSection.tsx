
import React, { useState } from 'react';
import { MapPin, Building, Clock, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    jobType: null,
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
    jobType: null,
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
    jobType: null,
  },
  {
    id: 5,
    title: 'Digital Marketer',
    company: 'All Marketer LTD',
    companyLogo: 'A',
    location: 'Wadesley Rd, London',
    category: 'Marketing',
    type: 'Freelance',
    timeAgo: '6 Hr Ago',
    featured: false,
    logoColor: 'bg-pink-500',
    jobType: null,
  },
  {
    id: 6,
    title: 'UI/UX Designer',
    company: 'Design Master',
    companyLogo: 'D',
    location: 'Zac Rd, London',
    category: 'Accountancy',
    type: 'Freelance',
    timeAgo: '8 Hr Ago',
    featured: false,
    logoColor: 'bg-indigo-500', 
    jobType: null,
  },
];

const JobsSection: React.FC = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (jobId: number) => {
    if (favorites.includes(jobId)) {
      setFavorites(favorites.filter(id => id !== jobId));
    } else {
      setFavorites([...favorites, jobId]);
    }
  };

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl animate-fade-in">
            Jobs You May Be Interested In
          </h2>
          <p className="text-gray-600 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Quis ipsum suspendisse ultrices.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobsData.map((job, index) => (
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
                        <a href={`/job/${job.id}`} className="hover:text-red transition-colors">
                          {job.title}
                        </a>
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

        <div className="mt-12 text-center">
          <a
            href="/jobs"
            className="inline-block rounded-md border border-red bg-white px-6 py-3 font-medium text-red transition-colors hover:bg-red hover:text-white animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            Browse All Jobs
          </a>
        </div>
      </div>
    </section>
  );
};

export default JobsSection;
