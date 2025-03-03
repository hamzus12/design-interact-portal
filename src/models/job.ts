
import db from '../lib/db';

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

export async function getAllJobs(): Promise<Job[]> {
  try {
    const [rows] = await db.query('SELECT * FROM jobs');
    return rows as Job[];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function getJobsByFilters(filters: {
  keyword?: string;
  category?: string[];
  jobType?: string[];
  location?: string[];
}): Promise<Job[]> {
  try {
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params: any[] = [];

    if (filters.keyword) {
      query += ' AND (title LIKE ? OR company LIKE ?)';
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    if (filters.category && filters.category.length > 0) {
      query += ' AND category IN (?)';
      params.push(filters.category);
    }

    if (filters.jobType && filters.jobType.length > 0) {
      query += ' AND jobType IN (?)';
      params.push(filters.jobType);
    }

    if (filters.location && filters.location.length > 0) {
      query += ' AND location LIKE ?';
      // This is a simplification - in a real app, you might want more sophisticated location matching
      params.push(`%${filters.location[0]}%`);
    }

    const [rows] = await db.query(query, params);
    return rows as Job[];
  } catch (error) {
    console.error('Error fetching jobs with filters:', error);
    return [];
  }
}

export async function getJobById(id: number): Promise<Job | null> {
  try {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);
    const jobRows = rows as Job[];
    return jobRows.length > 0 ? jobRows[0] : null;
  } catch (error) {
    console.error(`Error fetching job with ID ${id}:`, error);
    return null;
  }
}

export async function createJob(job: Omit<Job, 'id'>): Promise<number> {
  try {
    const [result] = await db.query(
      'INSERT INTO jobs (title, company, companyLogo, location, category, type, timeAgo, featured, logoColor, jobType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [job.title, job.company, job.companyLogo, job.location, job.category, job.type, job.timeAgo, job.featured, job.logoColor, job.jobType]
    );
    return (result as any).insertId;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}
