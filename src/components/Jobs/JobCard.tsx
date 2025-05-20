
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/models/job';
import { Heart, MapPin, Building, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

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
  const { language } = useLanguage();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(job.id);
    }
  };

  // Translations
  const locationText = {
    'en': 'Location:',
    'fr': 'Lieu:',
    'ar': 'الموقع:'
  }[language] || 'Location:';

  const categoryText = {
    'en': 'Category:',
    'fr': 'Catégorie:',
    'ar': 'التصنيف:'
  }[language] || 'Category:';

  const timeAgoText = {
    'en': 'Posted:',
    'fr': 'Publié:',
    'ar': 'نشرت:'
  }[language] || 'Posted:';

  return (
    <Link to={`/job/${job.id}`} className="block">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-primary/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${job.logoColor || 'bg-primary'} text-white`}>
              {job.companyLogo || job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{job.company}</p>
            </div>
          </div>
          {showFavoriteButton && onToggleFavorite && (
            <button 
              onClick={handleFavoriteClick} 
              className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("h-5 w-5", isFavorite ? "fill-primary text-primary" : "text-gray-400")} />
            </button>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {job.jobType || job.type}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
            {job.category}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
            {job.location}
          </Badge>
        </div>
        
        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
            <span>{locationText} {job.location}</span>
          </div>
          <div className="flex items-center">
            <Building className="mr-2 h-4 w-4 text-gray-400" />
            <span>{categoryText} {job.category}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-gray-400" />
            <span>{timeAgoText} {job.timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
