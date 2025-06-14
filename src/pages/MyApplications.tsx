
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
import { Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { chatService } from '@/services/ChatService';
import { useNavigate } from 'react-router-dom';

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
    recruiter_id: string;
  };
}

const MyApplications = () => {
  const { user, role } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Get database user ID
  const getDatabaseUserId = async (authUserId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUserId)
        .single();
      
      if (error || !data) return null;
      return data.id;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const dbUserId = await getDatabaseUserId(user.id);
        if (!dbUserId) {
          throw new Error('Could not find user profile');
        }
        
        // For candidates, show their applications
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs!inner(
              id,
              title,
              company,
              location,
              recruiter_id
            )
          `)
          .eq('candidate_id', dbUserId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('Fetched candidate applications:', data);
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
  }, [user, toast]);

  // Set up real-time subscription for application status updates
  useEffect(() => {
    if (!user) return;

    const setupRealtimeSubscription = async () => {
      const dbUserId = await getDatabaseUserId(user.id);
      if (!dbUserId) return;

      const channel = supabase
        .channel('application-status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'applications',
            filter: `candidate_id=eq.${dbUserId}`
          },
          (payload) => {
            console.log('Real-time application update:', payload);
            
            // Update the local state with the new status
            setApplications(prev => 
              prev.map(app => 
                app.id === payload.new.id 
                  ? { ...app, status: payload.new.status }
                  : app
              )
            );

            // Show toast notification for status change
            const statusMessages = {
              accepted: 'Your application has been accepted! 🎉',
              rejected: 'Your application has been rejected.',
              pending: 'Your application is now pending review.'
            };

            const message = statusMessages[payload.new.status as keyof typeof statusMessages] || 
                           `Application status updated to ${payload.new.status}`;

            toast({
              title: 'Application Status Updated',
              description: message,
              variant: payload.new.status === 'accepted' ? 'default' : 
                      payload.new.status === 'rejected' ? 'destructive' : 'default'
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [user, toast]);

  const handleContactRecruiter = async (application: Application) => {
    try {
      if (!user?.id) return;
      
      const dbUserId = await getDatabaseUserId(user.id);
      if (!dbUserId) {
        toast({
          title: 'Error',
          description: 'Could not find your user profile',
          variant: 'destructive'
        });
        return;
      }

      console.log('Creating conversation between candidate and recruiter:', {
        jobId: application.job.id,
        candidateId: dbUserId,
        recruiterId: application.job.recruiter_id
      });

      // Create or find existing conversation
      const conversation = await chatService.createConversation(
        application.job.id, 
        dbUserId,
        application.job.recruiter_id
      );
      
      console.log('Conversation created/found:', conversation);
      
      // Navigate to the conversation
      navigate(`/chat/${conversation.id}`);
      
      toast({
        title: 'Conversation Started',
        description: 'You can now chat with the recruiter',
      });
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start conversation',
        variant: 'destructive'
      });
    }
  };

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
          <h1 className="text-2xl font-bold">My Applications</h1>
          <Button asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Job Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
                <h3 className="text-lg font-semibold">No applications found</h3>
                <p className="text-gray-500 mt-2">
                  You haven't applied to any jobs yet. 
                  <Link to="/jobs" className="text-primary ml-1 hover:underline">
                    Browse available jobs
                  </Link>
                </p>
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
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactRecruiter(application)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact Recruiter
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/job/${application.job_id}`}>
                                View Job
                              </Link>
                            </Button>
                          </div>
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
