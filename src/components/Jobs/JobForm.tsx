
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading-button';
import { getJobCategories, getJobTypes } from '@/utils/jobValidation';

export interface JobFormData {
  title: string;
  company: string;
  location: string;
  description: string;
  category: string;
  jobType: string;
  salaryRange: string;
}

interface JobFormProps {
  formData: JobFormData;
  formErrors: Partial<Record<keyof JobFormData, string>>;
  loading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
  submitButtonText?: string;
}

const JobForm: React.FC<JobFormProps> = ({
  formData,
  formErrors,
  loading,
  handleInputChange,
  handleSelectChange,
  handleSubmit,
  handleCancel,
  submitButtonText = "Post Job"
}) => {
  const categories = getJobCategories();
  const jobTypes = getJobTypes();

  return (
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
          className={formErrors.title ? "border-red-500" : ""}
        />
        {formErrors.title && (
          <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company Name *</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="company"
            name="company"
            placeholder="e.g. Acme Inc."
            className={`pl-10 ${formErrors.company ? "border-red-500" : ""}`}
            value={formData.company}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        {formErrors.company && (
          <p className="text-red-500 text-sm mt-1">{formErrors.company}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="location"
            name="location"
            placeholder="e.g. New York, NY or Remote"
            className={`pl-10 ${formErrors.location ? "border-red-500" : ""}`}
            value={formData.location}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        {formErrors.location && (
          <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
            disabled={loading}
          >
            <SelectTrigger id="category" className={formErrors.category ? "border-red-500" : ""}>
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
            <SelectTrigger id="jobType" className={formErrors.jobType ? "border-red-500" : ""}>
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
          className={formErrors.description ? "border-red-500" : ""}
        />
        {formErrors.description && (
          <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <LoadingButton 
          type="submit" 
          isLoading={loading} 
          loadingText="Submitting..."
          className="min-w-[100px]"
        >
          {submitButtonText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default JobForm;
