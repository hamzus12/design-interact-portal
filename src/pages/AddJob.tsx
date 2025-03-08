import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Building, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/context/UserContext';

const AddJob = () => {
  const { user } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    category: 'technology',
    jobType: 'full-time',
    salaryRange: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
      
      // Modified approach: Try direct job insertion first
      const jobPayload = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        category: formData.category,
        job_type: formData.jobType,
        salary_range: formData.salaryRange
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
          throw new Error(`Failed to create user record: ${createUserError.message}`);
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
        throw new Error(`Failed to create job posting: ${jobError.message}`);
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

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'other', label: 'Other' }
  ];
  
  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Post a New Job</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Senior Frontend Developer"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company"
                      name="company"
                      placeholder="e.g. Acme Inc."
                      className="pl-10"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g. New York, NY or Remote"
                      className="pl-10"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                      disabled={loading}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type *</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) => handleSelectChange('jobType', value)}
                      disabled={loading}
                    >
                      <SelectTrigger id="jobType">
                        <SelectValue placeholder="Select a job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salaryRange">Salary Range</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="salaryRange"
                      name="salaryRange"
                      placeholder="e.g. $60,000 - $80,000 per year"
                      className="pl-10"
                      value={formData.salaryRange}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the job responsibilities, requirements, and other details..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={8}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/jobs')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Posting..." : "Post Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AddJob;
