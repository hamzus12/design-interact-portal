
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2,
  Bookmark,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { Job } from '@/types/Job';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (jobId: string | number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onApply, 
  showApplyButton = true,
  isFavorite = false,
  onToggleFavorite
}) => {
  const formatSalary = (salary: string) => {
    if (!salary) return 'Salary not specified';
    return `$${parseInt(salary).toLocaleString()}`;
  };

  const getJobTypeColor = (type?: string) => {
    if (!type) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'part-time':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contract':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'internship':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-50 text-gray-700 border-gray-200';
    
    switch (category.toLowerCase()) {
      case 'technology':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'finance':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'marketing':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'design':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-gray-200/50">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Bookmark button */}
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/80 backdrop-blur-sm"
        onClick={() => onToggleFavorite?.(job.id)}
      >
        <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current text-yellow-500' : ''}`} />
      </Button>

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {job.company_logo ? (
              <img 
                src={job.company_logo} 
                alt={`${job.company} logo`}
                className="h-12 w-12 rounded-xl object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {job.company.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {job.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">{job.company}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Hot</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Job details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{formatSalary(job.salary_range)}</span>
          </div>
        </div>

        {/* Description preview */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`${getJobTypeColor(job.job_type)} border font-medium`}>
            {job.job_type}
          </Badge>
          <Badge className={`${getCategoryColor(job.category)} border font-medium`}>
            {job.category}
          </Badge>
        </div>

        {/* Posted time */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            asChild 
            className="flex-1 mr-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-300"
          >
            <Link to={`/job/${job.id}`} className="flex items-center justify-center space-x-2">
              <ExternalLink className="h-4 w-4" />
              <span>View Details</span>
            </Link>
          </Button>
          
          {showApplyButton && onApply && (
            <Button 
              onClick={() => onApply(job.id.toString())}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
