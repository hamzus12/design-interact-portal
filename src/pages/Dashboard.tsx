
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import UsersList from '@/components/UsersList';
import { Users, Briefcase, BookmarkCheck, Plus } from 'lucide-react';
import JobCard from '@/components/Jobs/JobCard';
import { Job } from '@/models/job';

const Dashboard = () => {
  const { user, role } = useUserRole();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalBookmarks: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch recent jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (jobsError) throw jobsError;
        
        // Fetch bookmarked jobs
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('job_id')
          .eq('user_id', user.id);
        
        if (bookmarksError) throw bookmarksError;
        
        const bookmarkIds = bookmarksData.map(bookmark => bookmark.job_id);
        
        if (bookmarkIds.length > 0) {
          const { data: savedJobsData, error: savedJobsError } = await supabase
            .from('jobs')
            .select('*')
            .in('id', bookmarkIds)
            .limit(5);
            
          if (savedJobsError) throw savedJobsError;
          
          setSavedJobs(savedJobsData.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            companyLogo: job.company_logo || 'V',
            location: job.location,
            category: job.category,
            type: job.job_type,
            timeAgo: formatTimeAgo(job.created_at),
            featured: false,
            logoColor: getRandomLogoColor(),
            jobType: job.job_type
          })));
        }
        
        // Transform jobs data
        setRecentJobs(jobsData.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          companyLogo: job.company_logo || 'V',
          location: job.location,
          category: job.category,
          type: job.job_type,
          timeAgo: formatTimeAgo(job.created_at),
          featured: false,
          logoColor: getRandomLogoColor(),
          jobType: job.job_type
        })));
        
        // Get statistics
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
          
        const { count: applicationsCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true });
          
        const { count: bookmarksCount } = await supabase
          .from('bookmarks')
          .select('*', { count: 'exact', head: true });
          
        setStats({
          totalJobs: jobsCount || 0,
          totalApplications: applicationsCount || 0,
          totalBookmarks: bookmarksCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs === 1) return '1 Hr Ago';
    if (diffHrs < 24) return `${diffHrs} Hrs Ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return '1 Day Ago';
    if (diffDays < 30) return `${diffDays} Days Ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 Month Ago';
    return `${diffMonths} Months Ago`;
  };

  // Helper function to generate random logo colors
  const getRandomLogoColor = () => {
    const colors = [
      'bg-red', 
      'bg-blue-500', 
      'bg-green-500', 
      'bg-purple-500', 
      'bg-yellow-500', 
      'bg-indigo-500', 
      'bg-pink-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          {(role === 'recruiter' || role === 'admin') && (
            <Button asChild>
              <Link to="/add-job">
                <Plus className="mr-2 h-4 w-4" /> Post a Job
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">Jobs in our database</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">Total applications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookmarks}</div>
              <p className="text-xs text-muted-foreground">Bookmarked jobs</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Tabs defaultValue="recent-jobs">
            <TabsList>
              <TabsTrigger value="recent-jobs">Recent Jobs</TabsTrigger>
              <TabsTrigger value="saved-jobs">Saved Jobs</TabsTrigger>
              {(role === 'admin') && <TabsTrigger value="users">Users</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="recent-jobs" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Recently Added Jobs</h2>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                  
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/jobs">View All Jobs</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-gray-50 p-8 text-center">
                  <h3 className="text-lg font-semibold">No jobs found</h3>
                  <p className="text-gray-500">Be the first to post a job!</p>
                  
                  {(role === 'recruiter' || role === 'admin') && (
                    <Button asChild className="mt-4">
                      <Link to="/add-job">
                        <Plus className="mr-2 h-4 w-4" /> Post a Job
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="saved-jobs" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Your Saved Jobs</h2>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : savedJobs.length > 0 ? (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-gray-50 p-8 text-center">
                  <h3 className="text-lg font-semibold">No saved jobs</h3>
                  <p className="text-gray-500">Bookmark jobs to save them for later</p>
                  
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {(role === 'admin') && (
              <TabsContent value="users" className="mt-6">
                <h2 className="mb-4 text-xl font-semibold">All Users</h2>
                <UsersList />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
