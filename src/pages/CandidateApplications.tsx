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
import { Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Eye } from 'lucide-react';
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
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_id: string;
  };
}

const CandidateApplications = () => {
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
      if (!user) {
        console.log('No user found, skipping fetch');
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching applications for user:', user.id);
        
        const dbUserId = await getDatabaseUserId(user.id);
        console.log('Database user ID:', dbUserId);
        
        if (!dbUserId) {
          throw new Error('Could not find user profile');
        }
        
        // For recruiters, show applications for their job listings
        console.log('Fetching applications for recruiter with dbUserId:', dbUserId);
        
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
            ),
            candidate:users!applications_candidate_id_fkey(
              id,
              first_name,
              last_name,
              email,
              user_id
            )
          `)
          .eq('job.recruiter_id', dbUserId)
          .order('created_at', { ascending: false });
        
        console.log('Supabase query result:', { data, error });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Fetched applications:', data);
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

  // Set up real-time subscription for application updates
  useEffect(() => {
    if (!user) return;

    const setupRealtimeSubscription = async () => {
      const dbUserId = await getDatabaseUserId(user.id);
      if (!dbUserId) return;

      const channel = supabase
        .channel('recruiter-application-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'applications'
          },
          (payload) => {
            console.log('Real-time application update for recruiter:', payload);
            
            // Update the local state with the new status
            setApplications(prev => 
              prev.map(app => 
                app.id === payload.new.id 
                  ? { ...app, status: payload.new.status }
                  : app
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [user]);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      console.log(`Updating application ${applicationId} to status ${newStatus}`);
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update local state immediately for instant feedback
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      toast({
        title: 'Status Updated',
        description: `Application status changed to ${newStatus}`,
      });
      
      console.log('Application status updated successfully');
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update application status',
        variant: 'destructive'
      });
    }
  };

  const handleContactCandidate = async (application: Application) => {
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

      console.log('Creating conversation between recruiter and candidate:', {
        jobId: application.job.id,
        candidateId: application.candidate_id,
        recruiterId: dbUserId
      });

      // Create or find existing conversation
      const conversation = await chatService.createConversation(
        application.job.id, 
        application.candidate_id, 
        dbUserId
      );
      
      console.log('Conversation created/found:', conversation);
      
      // Navigate to the conversation
      navigate(`/chat/${conversation.id}`);
      
      toast({
        title: 'Conversation Started',
        description: 'You can now chat with the candidate',
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

  if (role !== 'recruiter' && role !== 'admin') {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-gray-600 mt-2">Only recruiters can view candidate applications.</p>
          </div>
        </div>
      </Layout>
    );
  }

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
          <h1 className="text-2xl font-bold">Candidate Applications</h1>
          <Button asChild>
            <Link to="/add-job">Post New Job</Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Applications for Your Job Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
                <h3 className="text-lg font-semibold">No applications found</h3>
                <p className="text-gray-500 mt-2">
                  No applications have been submitted for your job listings yet.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.candidate.first_name} {application.candidate.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.candidate.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{application.job.title}</div>
                            <div className="text-sm text-gray-500">{application.job.company}</div>
                          </div>
                        </TableCell>
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
                              onClick={() => handleContactCandidate(application)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/job/${application.job_id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Job
                              </Link>
                            </Button>
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(application.id, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
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

export default CandidateApplications;
