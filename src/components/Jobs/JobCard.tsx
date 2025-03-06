
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building, Clock, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/models/job';

interface JobCardProps {
  job: Job;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, index, isFavorite, onToggleFavorite }) => {
  return (
    <div
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
            onClick={onToggleFavorite}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red text-red' : 'text-gray-400'
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
  );
};

export default JobCard;
