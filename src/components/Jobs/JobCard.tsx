
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/models/job';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JobCardProps {
  job: Job;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (jobId: string | number) => void;
  showFavoriteButton?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  isFavorite = false, 
  onToggleFavorite, 
  showFavoriteButton = true 
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(job.id);
    }
  };

  return (
    <Link to={`/job/${job.id}`} className="block">
      <div className="rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-md ${job.logoColor || 'bg-primary'} text-white`}>
              {job.companyLogo || job.company.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <p className="text-sm text-gray-500">{job.company}</p>
            </div>
          </div>
          {showFavoriteButton && onToggleFavorite && (
            <button 
              onClick={handleFavoriteClick} 
              className="rounded-full p-1.5 hover:bg-gray-100"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("h-5 w-5", isFavorite ? "fill-red text-red" : "text-gray-400")} />
            </button>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {job.jobType || job.type}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {job.category}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            {job.location}
          </Badge>
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-xs text-gray-500">{job.timeAgo}</span>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
