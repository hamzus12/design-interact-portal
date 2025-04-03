
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useUserRole } from '@/context/UserContext';
import JobForm, { JobFormData } from '@/components/Jobs/JobForm';
import { validateJobData } from '@/utils/jobValidation';

const AddJob = () => {
  const { user } = useUserRole();
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
      
      console.log('Starting job submission process with user ID:', user.id);
      
      // First, check if this user already exists in our users table
      const { data: existingUser, error: userLookupError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      console.log('User lookup result:', { existingUser, userLookupError });
      
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
      
      // Only add recruiter_id if we have a valid user in the database
      if (existingUser?.id) {
        console.log('Found existing user with database ID:', existingUser.id);
        // @ts-ignore - Typescript might complain but this is valid
        jobPayload.recruiter_id = existingUser.id;
      } else {
        console.log('No existing user found, creating user record first');
        // Create a user record first
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            user_id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          })
          .select('id')
          .single();
          
        if (createUserError) {
          console.error('Error creating user record:', createUserError);
          throw new Error(handleSupabaseError(createUserError, "Failed to create user record"));
        }
        
        if (!newUser?.id) {
          throw new Error('Failed to create user: No ID returned');
        }
        
        console.log('Created new user with database ID:', newUser.id);
        // @ts-ignore - Typescript might complain but this is valid
        jobPayload.recruiter_id = newUser.id;
      }
      
      console.log('Final job payload:', jobPayload);
      
      // Now create the job with the proper UUID from our users table  
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert(jobPayload)
        .select();
      
      if (jobError) {
        console.error('Error creating job posting:', jobError);
        throw new Error(handleSupabaseError(jobError, "Failed to create job posting"));
      }
      
      console.log('Job posted successfully:', jobData);
      
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
