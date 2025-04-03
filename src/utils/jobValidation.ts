
import { CreateJobData } from '@/services/JobService';

export interface JobValidationErrors {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  category?: string;
  job_type?: string;
  salary_range?: string;
}

/**
 * Validate job data
 * @returns Object with validation errors or null if valid
 */
export function validateJobData(
  data: Partial<CreateJobData>
): JobValidationErrors | null {
  const errors: JobValidationErrors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Job title is required';
  } else if (data.title.length < 5) {
    errors.title = 'Job title must be at least 5 characters';
  } else if (data.title.length > 100) {
    errors.title = 'Job title must be less than 100 characters';
  }
  
  if (!data.company?.trim()) {
    errors.company = 'Company name is required';
  } else if (data.company.length < 2) {
    errors.company = 'Company name must be at least 2 characters';
  } else if (data.company.length > 100) {
    errors.company = 'Company name must be less than 100 characters';
  }
  
  if (!data.location?.trim()) {
    errors.location = 'Location is required';
  }
  
  if (!data.description?.trim()) {
    errors.description = 'Job description is required';
  } else if (data.description.length < 50) {
    errors.description = 'Job description must be at least 50 characters';
  }
  
  if (!data.category?.trim()) {
    errors.category = 'Category is required';
  }
  
  if (!data.job_type?.trim()) {
    errors.job_type = 'Job type is required';
  }
  
  if (data.salary_range && !/^\$?\d+(\s*-\s*\$?\d+)?(\s*per\s+\w+)?$/i.test(data.salary_range)) {
    errors.salary_range = 'Salary range format is invalid (e.g. $50,000 - $70,000 per year)';
  }
  
  return Object.keys(errors).length ? errors : null;
}

/**
 * Get allowed job categories
 */
export function getJobCategories() {
  return [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'other', label: 'Other' }
  ];
}

/**
 * Get allowed job types
 */
export function getJobTypes() {
  return [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' }
  ];
}
