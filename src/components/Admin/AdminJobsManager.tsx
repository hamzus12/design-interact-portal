
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  Eye, 
  Flag, 
  Trash, 
  Star,
  Building,
  MapPin,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  is_active: boolean;
  is_flagged: boolean;
  is_featured: boolean;
  flagged_reason: string | null;
  created_at: string;
  recruiter_id: string;
}

const AdminJobsManager = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres d'emploi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFlagJob = (job: Job) => {
    setSelectedJob(job);
    setFlagReason(job.flagged_reason || '');
    setFlagDialogOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const confirmFlagJob = async () => {
    if (!selectedJob) return;
    
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('jobs')
        .update({
          is_flagged: !selectedJob.is_flagged,
          flagged_reason: selectedJob.is_flagged ? null : flagReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedJob.id);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === selectedJob.id 
            ? {
                ...job, 
                is_flagged: !selectedJob.is_flagged,
                flagged_reason: selectedJob.is_flagged ? null : flagReason
              } 
            : job
        )
      );
      
      toast({
        title: "Succès",
        description: selectedJob.is_flagged 
          ? "L'offre a été démarquée" 
          : "L'offre a été signalée comme suspecte"
      });
      
      setFlagDialogOpen(false);
    } catch (error) {
      console.error('Error flagging job:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'offre",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteJob = async () => {
    if (!selectedJob) return;
    
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', selectedJob.id);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setJobs(prevJobs => prevJobs.filter(job => job.id !== selectedJob.id));
      
      toast({
        title: "Succès",
        description: "L'offre d'emploi a été supprimée"
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'offre",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFeatured = async (job: Job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          is_featured: !job.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      if (error) throw error;
      
      setJobs(prevJobs => 
        prevJobs.map(j => 
          j.id === job.id ? { ...j, is_featured: !job.is_featured } : j
        )
      );
      
      toast({
        title: "Succès",
        description: job.is_featured ? "Offre retirée des mises en avant" : "Offre mise en avant"
      });
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de mise en avant",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Gestion des Offres d'Emploi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offre</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aucune offre d'emploi trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {job.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          <span>{job.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          {job.company}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {job.is_flagged && (
                            <Badge variant="destructive" className="ml-1">
                              Signalée
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(job.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                          >
                            <Link to={`/job/${job.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleFeatured(job)}
                          >
                            <Star className={`h-4 w-4 ${job.is_featured ? 'fill-current text-yellow-500' : ''}`} />
                          </Button>
                          <Button
                            variant={job.is_flagged ? "default" : "outline"}
                            size="icon"
                            onClick={() => handleFlagJob(job)}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteJob(job)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour signaler/démarquer une offre */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedJob?.is_flagged ? "Démarquer l'offre" : "Signaler l'offre"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Raison
              </Label>
              <Textarea
                id="reason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder={selectedJob?.is_flagged ? "Raison du démarquage..." : "Pourquoi cette offre est-elle suspecte ?"}
                className="col-span-3"
                disabled={selectedJob?.is_flagged}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFlagDialogOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              variant={selectedJob?.is_flagged ? "default" : "destructive"}
              onClick={confirmFlagJob}
              disabled={actionLoading || (!selectedJob?.is_flagged && !flagReason.trim())}
            >
              {actionLoading ? "Traitement..." : 
               selectedJob?.is_flagged ? "Démarquer" : "Signaler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer une offre */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer l'offre "{selectedJob?.title}" ? 
              Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteJob}
              disabled={actionLoading}
            >
              {actionLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminJobsManager;
