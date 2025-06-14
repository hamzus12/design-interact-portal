
export interface Job {
  id: string | number;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  category: string;
  job_type: string;
  salary_range: string;
  description: string;
  created_at: string;
  updated_at?: string;
  recruiter_id?: string;
  is_active?: boolean;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  INTERVIEW = 'interview',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted'
}

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
