
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/context/UserContext';
import { useDatabase } from '@/context/DatabaseContext';
import JobCard from '@/components/Jobs/JobCard';
import UsersList from '@/components/UsersList';
import { Job } from '@/models/job';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Users, BookmarkIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { user, role } = useUserRole();
  const { jobs, favorites, toggleFavorite } = useDatabase();
  const [userCount, setUserCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch counts for admin dashboard
        if (role === 'admin') {
          // Get user count
          const { count: userCountData, error: userError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
          
          if (userError) throw userError;
          setUserCount(userCountData || 0);
        }
        
        // Get job count
        const { count: jobCountData, error: jobError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
        
        if (jobError) throw jobError;
        setJobCount(jobCountData || 0);
        
        // Get application count based on user role
        if (role === 'admin') {
          const { count: appCountData, error: appError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true });
          
          if (appError) throw appError;
          setApplicationCount(appCountData || 0);
        } else if (role === 'recruiter') {
          // Only count applications for recruiter's jobs
          const { count: appCountData, error: appError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('recruiter_id', user?.id);
          
          if (appError) throw appError;
          setApplicationCount(appCountData || 0);
        } else {
          // For candidates, count their applications
          const { count: appCountData, error: appError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', user?.id);
          
          if (appError) throw appError;
          setApplicationCount(appCountData || 0);
        }
        
        // Get recent jobs (5 most recent)
        let recentJobsQuery = supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Filter by recruiter if the user is a recruiter
        if (role === 'recruiter') {
          recentJobsQuery = recentJobsQuery.eq('recruiter_id', user?.id);
        }
        
        const { data: recentJobsData, error: recentError } = await recentJobsQuery;
        
        if (recentError) throw recentError;
        
        // Transform to Job type
        const transformedRecentJobs: Job[] = recentJobsData.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          companyLogo: job.company_logo || 'V',
          location: job.location,
          category: job.category,
          type: job.job_type,
          jobType: job.job_type,
          timeAgo: formatTimeAgo(job.created_at),
          featured: false,
          logoColor: getRandomLogoColor(),
        }));
        
        setRecentJobs(transformedRecentJobs);
        
        // Get saved jobs for candidates
        if (role === 'candidate' && user) {
          const { data: bookmarksData, error: bookmarksError } = await supabase
            .from('bookmarks')
            .select('job_id')
            .eq('user_id', user.id);
          
          if (bookmarksError) throw bookmarksError;
          
          if (bookmarksData && bookmarksData.length > 0) {
            const jobIds = bookmarksData.map(bookmark => bookmark.job_id);
            
            const { data: savedJobsData, error: savedError } = await supabase
              .from('jobs')
              .select('*')
              .in('id', jobIds);
            
            if (savedError) throw savedError;
            
            // Transform to Job type
            const transformedSavedJobs: Job[] = savedJobsData.map(job => ({
              id: job.id,
              title: job.title,
              company: job.company,
              companyLogo: job.company_logo || 'V',
              location: job.location,
              category: job.category,
              type: job.job_type,
              jobType: job.job_type,
              timeAgo: formatTimeAgo(job.created_at),
              featured: false,
              logoColor: getRandomLogoColor(),
            }));
            
            setSavedJobs(transformedSavedJobs);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user, role]);

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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto mt-8 px-4">
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto mt-8 px-4">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobCount}</div>
              <p className="text-xs text-muted-foreground">
                {role === 'recruiter' ? 'Jobs you posted' : 'Available jobs'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicationCount}</div>
              <p className="text-xs text-muted-foreground">
                {role === 'candidate' ? 'Your applications' : 'Received applications'}
              </p>
            </CardContent>
          </Card>
          
          {role === 'admin' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userCount}</div>
                <p className="text-xs text-muted-foreground">
                  Registered platform users
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Tabs for different dashboard sections */}
        <Tabs defaultValue="recent">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Recent Jobs</TabsTrigger>
            {role === 'candidate' && <TabsTrigger value="saved">Saved Jobs</TabsTrigger>}
            {role === 'admin' && <TabsTrigger value="users">Users</TabsTrigger>}
          </TabsList>
          
          {/* Recent Jobs Tab */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        isFavorite={favorites.includes(job.id)} 
                        onToggleFavorite={toggleFavorite}
                        showFavoriteButton={role === 'candidate'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-gray-50 p-8 text-center">
                    <h3 className="text-lg font-semibold">No jobs found</h3>
                    <p className="text-gray-500">
                      {role === 'recruiter' 
                        ? "You haven't posted any jobs yet." 
                        : "There are no jobs available at the moment."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Saved Jobs Tab (for candidates) */}
          {role === 'candidate' && (
            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {savedJobs.map((job) => (
                        <JobCard 
                          key={job.id} 
                          job={job} 
                          isFavorite={true} 
                          onToggleFavorite={toggleFavorite}
                          showFavoriteButton={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-gray-50 p-8 text-center">
                      <h3 className="text-lg font-semibold">No saved jobs</h3>
                      <p className="text-gray-500">
                        You haven't saved any jobs yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {/* Users Tab (for admin) */}
          {role === 'admin' && (
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <UsersList />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
