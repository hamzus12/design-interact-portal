
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUserRole } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  created_at: string;
  status: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
}

const MyApplications = () => {
  const { user, role } = useUserRole();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // For candidates, show their applications
        // For recruiters, show applications for their job listings
        const query = role === 'candidate'
          ? supabase
              .from('applications')
              .select(`
                *,
                job:job_id (
                  id,
                  title,
                  company,
                  location
                )
              `)
              .eq('candidate_id', user.id)
              .order('created_at', { ascending: false })
          : supabase
              .from('applications')
              .select(`
                *,
                job:job_id (
                  id,
                  title,
                  company,
                  location
                )
              `)
              .eq('job.recruiter_id', user.id)
              .order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setApplications(data as Application[]);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [user, role, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {role === 'candidate' ? 'My Applications' : 'Job Applications'}
          </h1>
          <Button asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {role === 'candidate' 
                ? 'Your Job Applications' 
                : 'Applications for Your Job Listings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
                <h3 className="text-lg font-semibold">No applications found</h3>
                {role === 'candidate' ? (
                  <p className="text-gray-500 mt-2">
                    You haven't applied to any jobs yet. 
                    <Link to="/jobs" className="text-primary ml-1 hover:underline">
                      Browse available jobs
                    </Link>
                  </p>
                ) : (
                  <p className="text-gray-500 mt-2">
                    No applications have been submitted for your job listings yet.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.job.title}
                        </TableCell>
                        <TableCell>{application.job.company}</TableCell>
                        <TableCell>{application.job.location}</TableCell>
                        <TableCell>{formatDate(application.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                            <span>{getStatusBadge(application.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/job/${application.job_id}`}>
                              View Job
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MyApplications;
