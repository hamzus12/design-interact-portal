
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { Job } from '@/models/job';

export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  description: string;
  category: string;
  job_type: string;
  salary_range?: string;
  recruiter_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface JobFilter {
  keyword?: string;
  category?: string[];
  jobType?: string[];
  location?: string[];
  recruiterId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

class JobService {
  /**
   * Get all jobs with optional filtering
   */
  async getJobs(filters?: JobFilter) {
    try {
      let query = supabase
        .from('jobs')
        .select('*');
      
      // Apply filters if provided
      if (filters) {
        // Filter by active status if specified
        if (filters.isActive !== undefined) {
          query = query.eq('is_active', filters.isActive);
        }
        
        // Filter by recruiter if specified
        if (filters.recruiterId) {
          query = query.eq('recruiter_id', filters.recruiterId);
        }
        
        // Apply keyword filter (search in title, company and description)
        if (filters.keyword) {
          query = query.or(`title.ilike.%${filters.keyword}%,company.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
        }
        
        // Apply category filter
        if (filters.category && filters.category.length > 0) {
          query = query.in('category', filters.category);
        }
        
        // Apply job type filter
        if (filters.jobType && filters.jobType.length > 0) {
          query = query.in('job_type', filters.jobType);
        }
        
        // Apply location filter
        if (filters.location && filters.location.length > 0) {
          const locationParam = filters.location[0];
          query = query.ilike('location', `%${locationParam}%`);
        }
        
        // Apply pagination
        if (filters.limit) {
          const page = filters.page || 1;
          const from = (page - 1) * filters.limit;
          const to = from + filters.limit - 1;
          
          query = query.range(from, to);
        }
      }
      
      // Order by created_at descending (newest first)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(handleSupabaseError(error));
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      return { data: null, error: err.message };
    }
  }
  
  /**
   * Get a job by ID
   */
  async getJobById(id: string | number) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, users(first_name, last_name, email)')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(handleSupabaseError(error));
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error fetching job with ID ${id}:`, err);
      return { data: null, error: err.message };
    }
  }
  
  /**
   * Create a new job
   */
  async createJob(jobData: CreateJobData, userId: string) {
    try {
      // First, find the database user ID for the given Clerk user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (userError) {
        throw new Error(handleSupabaseError(userError));
      }
      
      if (!userData) {
        // User not found, create user record first
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            user_id: userId,
            email: jobData.company, // Fallback, this should be replaced with actual email
            role: 'recruiter'
          })
          .select('id')
          .single();
          
        if (createUserError) {
          throw new Error(handleSupabaseError(createUserError, "Failed to create user record"));
        }
        
        // Set the recruiter_id to the newly created user
        jobData.recruiter_id = newUser.id;
      } else {
        // Set the recruiter_id to the existing user
        jobData.recruiter_id = userData.id;
      }
      
      // Set is_active to true by default if not specified
      if (jobData.is_active === undefined) {
        jobData.is_active = true;
      }
      
      // Now create the job
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select();
      
      if (error) {
        throw new Error(handleSupabaseError(error));
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating job:', err);
      return { data: null, error: err.message };
    }
  }
  
  /**
   * Update an existing job
   */
  async updateJob(id: string | number, jobData: Partial<CreateJobData>) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(handleSupabaseError(error));
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error updating job with ID ${id}:`, err);
      return { data: null, error: err.message };
    }
  }
  
  /**
   * Delete a job
   */
  async deleteJob(id: string | number) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(handleSupabaseError(error));
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error deleting job with ID ${id}:`, err);
      return { data: null, error: err.message };
    }
  }
  
  /**
   * Toggle job active status
   */
  async toggleJobActiveStatus(id: string | number, isActive: boolean) {
    return this.updateJob(id, { is_active: isActive });
  }
  
  /**
   * Toggle job featured status
   */
  async toggleJobFeaturedStatus(id: string | number, isFeatured: boolean) {
    return this.updateJob(id, { is_featured: isFeatured });
  }
  
  /**
   * Get jobs posted by a specific recruiter
   */
  async getRecruiterJobs(recruiterId: string) {
    return this.getJobs({ recruiterId, isActive: true });
  }
}

export const jobService = new JobService();
