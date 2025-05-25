import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/context/UserContext';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Heart, 
  Share, 
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { chatService } from '@/services/ChatService';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getJobById, toggleFavorite, favorites, submitApplication } = useDatabase();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);

  // Helper function to get database user ID from auth user ID
  const getDatabaseUserId = async (authUserId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUserId)
        .single();
      
      if (error || !data) {
        console.error('Error getting database user ID:', error);
        return null;
      }
      
      return data.id;
    } catch (err) {
      console.error('Error getting database user ID:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadJob = async () => {
      try {
        if (id) {
          const jobData = await getJobById(id);
          setJob(jobData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, getJobById]);

  // Check if job is in favorites when favorites or job changes
  useEffect(() => {
    if (job && favorites) {
      setIsFavorite(favorites.includes(job.id));
    }
  }, [favorites, job]);

  const handleToggleFavorite = () => {
    if (job) {
      toggleFavorite(job.id);
    }
  };

  const handleApplyClick = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to sign in to apply for jobs.",
        variant: "destructive",
      });
      navigate('/signin', { state: { from: `/job/${id}` } });
      return;
    }

    if (role !== 'candidate') {
      toast({
        title: "Action not allowed",
        description: "Only candidates can apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplying(true);
      await submitApplication(job.id);
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
      navigate('/my-applications');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleContactRecruiter = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to sign in to contact the recruiter.",
        variant: "destructive",
      });
      navigate('/signin', { state: { from: `/job/${id}` } });
      return;
    }

    if (role !== 'candidate') {
      toast({
        title: "Action not allowed",
        description: "Only candidates can contact recruiters for job applications.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if job has a recruiter_id
      if (!job.recruiterId) {
        toast({
          title: "Contact Not Available",
          description: "The recruiter contact information is not available for this job.",
          variant: "destructive",
        });
        return;
      }

      // Get database user ID for the candidate
      const candidateDbId = await getDatabaseUserId(user.id);
      if (!candidateDbId) {
        toast({
          title: "Error",
          description: "Could not find your user profile. Please try refreshing the page.",
          variant: "destructive",
        });
        return;
      }

      // Create or find existing conversation using database user IDs
      const conversation = await chatService.createConversation(
        job.id, 
        candidateDbId, // Use database user ID for candidate
        job.recruiterId // This is already a database user ID from the job
      );
      
      // Navigate to the conversation
      navigate(`/chat/${conversation.id}`);
      
      toast({
        title: "Conversation Started",
        description: "You can now chat with the recruiter about this job.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation with recruiter.",
        variant: "destructive",
      });
    }
  };

  const handleShareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Job link has been copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/30">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Job not found</h2>
            <p className="mt-2 text-red-600 dark:text-red-300">{error || "The requested job does not exist or has been removed."}</p>
            <Button asChild className="mt-4">
              <Link to="/jobs">View All Jobs</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Job header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="md:flex md:items-start md:justify-between">
            <div className="md:flex md:items-start md:space-x-6">
              <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${job?.logoColor || 'bg-primary'} text-white`}>
                {job?.companyLogo || job?.company?.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="mt-4 text-2xl font-bold md:mt-0">{job?.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Building className="mr-1 h-4 w-4" />
                    {job?.company}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job?.location}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="mr-1 h-4 w-4" />
                    {job?.timeAgo}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2 md:mt-0">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleToggleFavorite}
                className="rounded-full"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : 'text-gray-500'}`} />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleShareJob}
                className="rounded-full"
              >
                <Share className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                {job?.jobType || job?.type}
              </Badge>
              
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                {job?.category}
              </Badge>
              
              {job?.salaryRange && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                  {job?.salaryRange}
                </Badge>
              )}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Button 
                onClick={handleApplyClick}
                disabled={applying || role !== 'candidate'}
                className="bg-primary hover:bg-primary/90"
              >
                {applying ? "Submitting..." : "Apply Now"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleContactRecruiter}
                disabled={role !== 'candidate'}
                className="flex items-center"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Recruiter
              </Button>
            </div>
          </div>
        </div>
        
        {/* Job details */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="text-xl font-semibold">Job Description</h2>
              <div className="prose mt-4 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: job.description }}></div>
            </div>
          </div>
          
          <div>
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="text-lg font-semibold">Job Details</h2>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <Calendar className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Job Type</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.jobType || job.type}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Briefcase className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Category</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.category}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.location}</p>
                  </div>
                </div>
                
                {job.salary_range && (
                  <div className="flex items-start">
                    <DollarSign className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">Salary Range</h3>
                      <p className="text-gray-600 dark:text-gray-300">{job.salary_range}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Building className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Company</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Apply for this job</h3>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Submit your application now to join {job.company} as a {job.title}.
              </p>
              <Button 
                className="mt-4 w-full bg-primary hover:bg-primary/90"
                onClick={handleApplyClick}
                disabled={applying || (role === 'recruiter' || role === 'admin')}
              >
                {applying ? "Submitting..." : "Apply Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
