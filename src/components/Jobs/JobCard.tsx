
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Heart,
  ExternalLink,
  Zap,
  TrendingUp,
  Brain,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJobPersona } from '@/context/JobPersonaContext';
import { Job } from '@/models/job';

interface JobCardProps {
  job: Job;
  isFavorite?: boolean;
  onToggleFavorite?: (jobId: string | number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isFavorite = false, onToggleFavorite }) => {
  const { persona, generateApplication } = useJobPersona();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(job.id);
    }
  };

  const handleGenerateCoverLetter = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!persona) {
      return;
    }

    try {
      await generateApplication(job.id.toString());
    } catch (error) {
      console.error('Error generating cover letter:', error);
    }
  };

  const isNewJob = () => {
    const jobDate = new Date(job.createdAt || job.timeAgo);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return jobDate > threeDaysAgo;
  };

  const isUrgent = () => {
    return job.description?.toLowerCase().includes('urgent') || 
           job.title?.toLowerCase().includes('urgent');
  };

  // Calculate match score if persona exists
  const getMatchScore = () => {
    if (!persona) return null;
    
    // Simple scoring algorithm based on skills and preferences
    let score = 50; // Base score
    
    // Check skills match
    const jobText = `${job.title} ${job.description} ${job.category}`.toLowerCase();
    const matchingSkills = persona.skills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    );
    score += Math.min(matchingSkills.length * 10, 30);
    
    // Check job type preference
    if (persona.preferences.jobTypes.some(type => 
      job.type?.toLowerCase().includes(type.toLowerCase()) ||
      job.jobType?.toLowerCase().includes(type.toLowerCase())
    )) {
      score += 10;
    }
    
    // Check location preference
    if (persona.preferences.locations.some(loc => 
      job.location?.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 10;
    }
    
    return Math.min(score, 99);
  };

  const matchScore = getMatchScore();

  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 shadow-lg bg-white/80 backdrop-blur-sm relative overflow-hidden">
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Job badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {isNewJob() && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    Nouveau
                  </Badge>
                )}
                {isUrgent() && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
                {matchScore && (
                  <Badge className={`text-xs ${
                    matchScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    matchScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                    'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  }`}>
                    <Brain className="w-3 h-3 mr-1" />
                    {matchScore}% Match
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                  {job.category}
                </Badge>
              </div>
              
              {/* Job title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {job.title}
              </h3>
              
              {/* Company */}
              <p className="text-lg font-semibold text-blue-600 mb-3">
                {job.company}
              </p>
            </div>
            
            {/* Favorite button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={`ml-2 p-2 rounded-full transition-all duration-300 ${
                isFavorite 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Job details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm">{job.location}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Briefcase className="h-4 w-4 mr-2 text-purple-500" />
              <span className="text-sm">{job.type}</span>
            </div>
            
            {job.salaryRange && (
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">{job.salaryRange}</span>
              </div>
            )}
            
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              <span className="text-sm">
                {job.createdAt ? new Date(job.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short'
                }) : job.timeAgo}
              </span>
            </div>
          </div>
          
          {/* Job description preview */}
          <p className="text-gray-700 text-sm leading-relaxed mb-6 line-clamp-3">
            {job.description}
          </p>
          
          {/* Skills/Category tags */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Domaine:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                {job.category}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                {job.type}
              </Badge>
              {job.jobType && job.jobType !== job.type && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                  {job.jobType}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="space-y-2">
            {/* Main action button */}
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Link to={`/job/${job.id}`}>
                <span>Voir les Détails</span>
                <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {/* JobPersona AI button */}
            {persona && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={handleGenerateCoverLetter}
              >
                <FileText className="mr-2 h-4 w-4" />
                Générer lettre de motivation IA
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default JobCard;
