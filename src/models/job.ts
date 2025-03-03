
// Define Job interface
export interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  category: string;
  type: string;
  timeAgo: string;
  featured: boolean;
  logoColor: string;
  jobType: string | null;
}

// Sample job data
const jobsData: Job[] = [
  {
    id: 1,
    title: 'Post-Room Operate',
    company: 'Teast Design LTD',
    companyLogo: 'V',
    location: 'Wadesley Rd, London',
    category: 'Accountancy',
    type: 'Freelance',
    timeAgo: '1 Hr Ago',
    featured: true,
    logoColor: 'bg-green-500',
    jobType: 'Full Time',
  },
  {
    id: 2,
    title: 'Data Entry',
    company: 'Techno Inc.',
    companyLogo: 'T',
    location: 'Street 45A, London',
    category: 'Data Entry',
    type: 'Freelance',
    timeAgo: '3 Hr Ago',
    featured: false,
    logoColor: 'bg-red-600',
    jobType: 'Part Time',
  },
  {
    id: 3,
    title: 'Graphic Designer',
    company: 'Dewen Design',
    companyLogo: 'U',
    location: 'West Sight, USA',
    category: 'Graphics',
    type: 'Freelance',
    timeAgo: '4 Hr Ago',
    featured: false,
    logoColor: 'bg-blue-500',
    jobType: 'Full Time',
  },
  {
    id: 4,
    title: 'Web Developer',
    company: 'MegaNews',
    companyLogo: 'M',
    location: 'San Francisco, California',
    category: 'Development',
    type: 'Freelance',
    timeAgo: '5 Hr Ago',
    featured: false,
    logoColor: 'bg-purple-500',
    jobType: 'Remote',
  },
  {
    id: 5,
    title: 'Digital Marketer',
    company: 'All Marketer LTD',
    companyLogo: 'A',
    location: 'Wadesley Rd, London',
    category: 'Marketing',
    type: 'Full Time',
    timeAgo: '6 Hr Ago',
    featured: false,
    logoColor: 'bg-pink-500',
    jobType: 'On Site',
  },
  {
    id: 6,
    title: 'UI/UX Designer',
    company: 'Design Master',
    companyLogo: 'D',
    location: 'Zac Rd, London',
    category: 'Accountancy',
    type: 'Part Time',
    timeAgo: '8 Hr Ago',
    featured: false,
    logoColor: 'bg-indigo-500',
    jobType: 'Hybrid',
  },
];

export async function getAllJobs(): Promise<Job[]> {
  return jobsData;
}

export async function getJobsByFilters(filters: {
  keyword?: string;
  category?: string[];
  jobType?: string[];
  location?: string[];
}): Promise<Job[]> {
  let filteredJobs = [...jobsData];
  
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(keyword) || 
      job.company.toLowerCase().includes(keyword)
    );
  }

  if (filters.category && filters.category.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      filters.category?.includes(job.category)
    );
  }

  if (filters.jobType && filters.jobType.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      job.jobType && filters.jobType?.includes(job.jobType)
    );
  }

  if (filters.location && filters.location.length > 0) {
    const location = filters.location[0].toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location)
    );
  }

  return filteredJobs;
}

export async function getJobById(id: number): Promise<Job | null> {
  const job = jobsData.find(job => job.id === id);
  return job || null;
}

export async function createJob(job: Omit<Job, 'id'>): Promise<number> {
  // This is a mock implementation since we're not using a database
  // In a real app, this would add to a database and return the new ID
  const newId = Math.max(...jobsData.map(j => j.id)) + 1;
  // Note: In a real implementation, we would modify the jobs array
  return newId;
}
