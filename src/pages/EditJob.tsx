
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Building, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/context/UserContext';

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    category: 'technology',
    jobType: 'full-time',
    salaryRange: ''
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        setInitialLoading(true);
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Check if user has permission to edit this job
        if (user?.id !== data.recruiter_id && role !== 'admin') {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to edit this job listing",
            variant: "destructive"
          });
          navigate('/jobs');
          return;
        }
        
        // Set form data from job details
        setFormData({
          title: data.title || '',
          company: data.company || '',
          location: data.location || '',
          description: data.description || '',
          category: data.category || 'technology',
          jobType: data.job_type || 'full-time',
          salaryRange: data.salary_range || ''
        });
      } catch (error: any) {
        console.error('Error fetching job details:', error);
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again.",
          variant: "destructive"
        });
        navigate('/jobs');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id, navigate, toast, user, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update a job",
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
      
      const { error } = await supabase
        .from('jobs')
        .update({
          title: formData.title,
          company: formData.company,
          location: formData.location,
          description: formData.description,
          category: formData.category,
          job_type: formData.jobType,
          salary_range: formData.salaryRange,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Job listing has been updated successfully!"
      });
      
      navigate(`/job/${id}`);
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job. Please try again.",
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

  if (initialLoading) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Job Listing</CardTitle>
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
                    onClick={() => navigate(`/job/${id}`)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Job"}
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

export default EditJob;
