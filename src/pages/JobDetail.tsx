
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  MapPin,
  Building,
  Clock,
  BriefcaseBusiness,
  Share2,
  BookmarkPlus,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/context/UserContext';
import { Job } from '@/models/job';
import { useDatabase } from '@/context/DatabaseContext';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useUserRole();
  const { favorites, toggleFavorite } = useDatabase();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [isRecruiterOrAdmin, setIsRecruiterOrAdmin] = useState(false);
  const [isJobOwner, setIsJobOwner] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (id) {
          setLoading(true);
          const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;

          // Transform to Job type
          const transformedJob: Job = {
            id: data.id,
            title: data.title,
            company: data.company,
            companyLogo: data.company_logo || data.company.charAt(0),
            location: data.location,
            category: data.category,
            type: data.job_type,
            jobType: data.job_type,
            timeAgo: formatTimeAgo(data.created_at),
            featured: false,
            logoColor: getRandomLogoColor(),
            description: data.description,
            salaryRange: data.salary_range,
            recruiterId: data.recruiter_id
          };
          
          setJob(transformedJob);
          
          // Check if current user is the recruiter who posted this job
          if (user && data.recruiter_id === user.id) {
            setIsJobOwner(true);
          }
          
          // Check if user is recruiter or admin (for UI controls)
          setIsRecruiterOrAdmin(role === 'recruiter' || role === 'admin');
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    window.scrollTo(0, 0);
  }, [id, user, role]);

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for this job",
        variant: "destructive"
      });
      navigate("/signin");
      return;
    }

    if (role !== 'candidate') {
      toast({
        title: "Permission Denied",
        description: "Only candidates can apply for jobs",
        variant: "destructive"
      });
      return;
    }

    setIsApplyDialogOpen(true);
  };

  const submitApplication = async () => {
    if (!job || !user) return;
    
    try {
      setApplyLoading(true);
      
      // Check if the user has already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', job.id)
        .eq('candidate_id', user.id)
        .single();
      
      if (existingApplication) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this job",
          variant: "destructive"
        });
        setIsApplyDialogOpen(false);
        return;
      }
      
      // Create application
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          candidate_id: user.id,
          cover_letter: coverLetter,
          status: 'pending',
          resume_url: user.resumeUrl
        });
      
      if (error) throw error;
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully"
      });
      
      setIsApplyDialogOpen(false);
      setCoverLetter('');
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleEditJob = () => {
    if (job) {
      navigate(`/edit-job/${job.id}`);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    
    try {
      setDeleteLoading(true);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id);
      
      if (error) throw error;
      
      toast({
        title: "Job Deleted",
        description: "The job has been deleted successfully"
      });
      
      navigate('/jobs');
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleBookmark = () => {
    if (job) {
      toggleFavorite(job.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Job link copied to clipboard"
    });
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs === 1) return '1 Hr Ago';
    if (diffHrs < 24) return `${diffHrs} Hrs Ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return '1 Day Ago';
    if (diffDays < 30) return `${diffDays} Days Ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 Month Ago';
    return `${diffMonths} Months Ago`;
  };

  // Helper function to generate random logo colors
  const getRandomLogoColor = () => {
    const colors = [
      'bg-red', 
      'bg-blue-500', 
      'bg-green-500', 
      'bg-purple-500', 
      'bg-yellow-500', 
      'bg-indigo-500', 
      'bg-pink-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex animate-pulse flex-col space-y-4 rounded-lg bg-white p-8 shadow-md">
            <div className="h-8 w-3/4 rounded bg-gray-200"></div>
            <div className="h-6 w-1/2 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Job Not Found</h2>
            <p className="mb-6 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          {/* Back Navigation */}
          <Link 
            to="/jobs" 
            className="mb-8 inline-flex items-center text-red hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Job Details - Left Column */}
            <div className="lg:col-span-2">
              <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-md">
                {/* Job Header */}
                <div className="border-b border-gray-100 bg-red-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`mr-4 flex h-16 w-16 items-center justify-center rounded-lg ${job.logoColor} text-white text-2xl`}>
                        {job.companyLogo}
                      </div>
                      <div>
                        <h1 className="mb-1 text-2xl font-bold text-gray-900">{job.title}</h1>
                        <p className="text-gray-700">at {job.company}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleBookmark}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-red"
                      >
                        <BookmarkPlus className={`h-5 w-5 ${favorites.includes(job.id) ? "fill-red text-red" : ""}`} />
                      </button>
                      <button 
                        onClick={handleShare}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-red"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="p-6">
                  <div className="mb-6 flex flex-wrap gap-4">
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.location}
                    </div>
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <Building className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.category}
                    </div>
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <BriefcaseBusiness className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.jobType || job.type}
                    </div>
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <Clock className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.timeAgo}
                    </div>
                  </div>

                  {job.featured && (
                    <Badge className="mb-6 bg-red text-white">Featured</Badge>
                  )}

                  <div className="mb-8 border-b border-gray-100 pb-8">
                    <h2 className="mb-4 text-xl font-semibold">Job Description</h2>
                    <p className="whitespace-pre-line text-gray-700">{job.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Admin/Recruiter Controls */}
              {isJobOwner && (
                <div className="mb-6 flex space-x-4">
                  <Button 
                    variant="outline" 
                    className="w-1/2"
                    onClick={handleEditJob}
                  >
                    Edit Job
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-1/2"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete Job
                  </Button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div>
              {/* Application Card */}
              <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold">Job Summary</h2>
                <div className="mb-4 space-y-3">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Published On:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Job Type:</span>
                    <span className="font-medium">{job.jobType || job.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{job.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                  {job.salaryRange && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Salary:</span>
                      <span className="font-medium">{job.salaryRange}</span>
                    </div>
                  )}
                </div>
                
                {/* Only show apply button to candidates */}
                {role === 'candidate' && (
                  <Button 
                    onClick={handleApply} 
                    className="mt-4 w-full bg-red hover:bg-red/90"
                  >
                    Apply Now
                  </Button>
                )}
              </div>

              {/* Company Information */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold">About {job.company}</h2>
                <div className="mb-4 flex items-center">
                  <div className={`mr-3 flex h-12 w-12 items-center justify-center rounded-lg ${job.logoColor} text-white`}>
                    {job.companyLogo}
                  </div>
                  <div>
                    <h3 className="font-semibold">{job.company}</h3>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-700">
                  {job.company} is a leading organization in the {job.category.toLowerCase()} industry, dedicated to innovation and excellence. With a strong commitment to quality and customer satisfaction, we strive to deliver exceptional products and services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="mb-2">
              <h3 className="mb-2 font-semibold">Cover Letter</h3>
              <Textarea
                placeholder="Tell us why you're a good fit for this role..."
                className="h-32"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Resume</h3>
              {user?.resumeUrl ? (
                <div className="flex items-center rounded-md border border-gray-200 p-2">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Your resume is attached</p>
                    <p className="text-gray-500">Resume will be included with your application</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                  <p>No resume found. You can add one in your profile.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setIsApplyDialogOpen(false);
                      navigate('/profile');
                    }}
                  >
                    Go to Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApplyDialogOpen(false)}
              disabled={applyLoading}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red hover:bg-red/90"
              onClick={submitApplication}
              disabled={applyLoading}
            >
              {applyLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete this job listing? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteJob}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetail;
