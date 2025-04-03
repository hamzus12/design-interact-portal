
// Define Job interface
export interface Job {
  id: number | string;  // Supports UUID strings from Supabase
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  category: string;
  type: string;
  timeAgo: string;
  featured: boolean;
  logoColor: string;
  jobType: string;
  description?: string;
  salaryRange?: string;
  recruiterId?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

// Job application status enum
export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  INTERVIEW = 'interview',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted'
}

// Job application interface
export interface JobApplication {
  id: number | string;
  jobId: number | string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
}

// Export functions for backward compatibility 
// These are now implemented in DatabaseContext or JobService
export async function getAllJobs(): Promise<Job[]> {
  // This is just a placeholder for backward compatibility
  // The actual implementation is in DatabaseContext
  return [];
}

export async function getJobsByFilters(filters: {
  keyword?: string;
  category?: string[];
  jobType?: string[];
  location?: string[];
}): Promise<Job[]> {
  // This is just a placeholder for backward compatibility
  // The actual implementation is in DatabaseContext
  return [];
}

export async function getJobById(id: number | string): Promise<Job | null> {
  // This is just a placeholder for backward compatibility
  // The actual implementation is now in JobService
  return null;
}

export async function createJob(job: Omit<Job, 'id'>): Promise<number | string> {
  // This is just a placeholder for backward compatibility
  // The actual implementation is now in JobService
  return 0;
}
