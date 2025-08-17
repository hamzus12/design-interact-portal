import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';

interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  created_at: string;
  status: string;
  cover_letter: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface RecruiterApplicationsViewProps {
  dbUserId?: string;
}

const RecruiterApplicationsView: React.FC<RecruiterApplicationsViewProps> = ({ dbUserId }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!dbUserId) {
        console.log('No dbUserId provided to RecruiterApplicationsView');
        setApplications([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching applications for recruiter dbUserId:', dbUserId);
        
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
              email
            )
          `)
          .eq('job.recruiter_id', dbUserId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        setApplications(data as Application[]);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les candidatures',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [dbUserId]);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      toast({
        title: 'Statut mis à jour',
        description: `Candidature ${newStatus === 'accepted' ? 'acceptée' : 'refusée'}`,
      });
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
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
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">En attente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Acceptée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Refusée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dbUserId) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Profil en cours de chargement</h3>
          <p>Veuillez patienter pendant que nous chargeons vos données...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Aucune candidature</h3>
          <p>Aucune candidature n'a été soumise pour vos offres d'emploi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidat</TableHead>
            <TableHead>Poste</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
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
              <TableCell>
                {new Date(application.created_at).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(application.status)}
                  {getStatusBadge(application.status)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(application.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      >
                        Refuser
                      </Button>
                    </>
                  )}
                  {application.status !== 'pending' && (
                    <Badge variant="secondary">
                      {application.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {applications.length === 10 && (
        <div className="p-4 text-center border-t">
          <Button variant="outline" asChild>
            <a href="/candidate-applications">
              Voir toutes les candidatures
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicationsView;