
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import JobForm, { JobFormData } from '@/components/Jobs/JobForm';
import { validateJobData } from '@/utils/jobValidation';
import { jobService } from '@/services/JobService';

const AddJob = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    description: '',
    category: 'technology', // Default value
    jobType: 'full-time',  // Default value
    salaryRange: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to post a job",
        variant: "destructive"
      });
      navigate('/signin');
    }
  }, [authLoading, user, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name as keyof JobFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name as keyof JobFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    // Validate job data
    const errors = validateJobData({
      title: formData.title,
      company: formData.company,
      location: formData.location,
      description: formData.description,
      category: formData.category,
      job_type: formData.jobType,
      salary_range: formData.salaryRange
    });
    
    if (errors) {
      setFormErrors(errors);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to post a job",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Submitting job with data:', formData);
      
      // Build job payload
      const jobPayload = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        category: formData.category,
        job_type: formData.jobType,
        salary_range: formData.salaryRange,
        is_active: true // Ensure job is active by default
      };
      
      // Use the job service to create the job
      const { data, error } = await jobService.createJob(jobPayload, user.id);
      
      if (error) {
        throw new Error(error);
      }
      
      console.log('Job posted successfully:', data);
      
      toast({
        title: "Success",
        description: "Your job has been posted successfully!"
      });
      
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error adding job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render the form if not authenticated
  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50 rounded-t-lg">
              <CardTitle className="text-2xl">Post a New Job</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <JobForm
                formData={formData}
                formErrors={formErrors}
                loading={loading}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleSubmit={handleSubmit}
                handleCancel={() => navigate('/jobs')}
                submitButtonText="Post Job"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AddJob;
