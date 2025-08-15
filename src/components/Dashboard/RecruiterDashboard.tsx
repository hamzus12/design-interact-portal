
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserRole } from '@/context/UserContext';
import { useDatabase } from '@/context/DatabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import RecruiterApplicationsView from './RecruiterApplicationsView';

interface RecruiterStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

interface JobWithApplications {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  is_active: boolean;
  applications_count: number;
  pending_count: number;
}

const RecruiterDashboard: React.FC = () => {
  const { user } = useUserRole();
  const { jobs, loading: loadingJobs } = useDatabase();
  const [stats, setStats] = useState<RecruiterStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });
  const [jobsWithApplications, setJobsWithApplications] = useState<JobWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadRecruiterData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get database user ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (userError || !userData) {
          throw new Error('Could not find user profile');
        }

        const dbUserId = userData.id;
        setDbUserId(dbUserId);

        // Get recruiter's jobs
        const { data: recruiterJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', dbUserId)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Get applications for recruiter's jobs
        const jobIds = recruiterJobs?.map(job => job.id) || [];
        
        let applications = [];
        if (jobIds.length > 0) {
          const { data: applicationsData, error: applicationsError } = await supabase
            .from('applications')
            .select('*')
            .in('job_id', jobIds);

          if (applicationsError) throw applicationsError;
          applications = applicationsData || [];
        }

        // Calculate stats
        const totalJobs = recruiterJobs?.length || 0;
        const activeJobs = recruiterJobs?.filter(job => job.is_active)?.length || 0;
        const totalApplications = applications.length;
        const pendingApplications = applications.filter(app => app.status === 'pending').length;
        const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
        const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

        setStats({
          totalJobs,
          activeJobs,
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications
        });

        // Prepare jobs with application counts
        const jobsWithAppCounts = recruiterJobs?.map(job => {
          const jobApplications = applications.filter(app => app.job_id === job.id);
          const pendingCount = jobApplications.filter(app => app.status === 'pending').length;
          
          return {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            created_at: job.created_at,
            is_active: job.is_active,
            applications_count: jobApplications.length,
            pending_count: pendingCount
          };
        }) || [];

        setJobsWithApplications(jobsWithAppCounts);

      } catch (error: any) {
        console.error('Error loading recruiter data:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger les données du recruteur',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecruiterData();
  }, [user]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord recruteur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Tableau de Bord Recruteur
          </h1>
          <p className="text-gray-600">
            Gérez vos offres d'emploi et suivez les candidatures
          </p>
        </div>
        <Button asChild>
          <Link to="/add-job">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Offre
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Offres Totales</p>
                <p className="text-3xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Offres Actives</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Candidatures</p>
                <p className="text-3xl font-bold">{stats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">En Attente</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statut des Candidatures</CardTitle>
            <CardDescription>Répartition de vos candidatures reçues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  En attente
                </span>
                <span>{stats.pendingApplications}</span>
              </div>
              <Progress 
                value={stats.totalApplications > 0 ? (stats.pendingApplications / stats.totalApplications) * 100 : 0} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Acceptées
                </span>
                <span>{stats.acceptedApplications}</span>
              </div>
              <Progress 
                value={stats.totalApplications > 0 ? (stats.acceptedApplications / stats.totalApplications) * 100 : 0} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Refusées
                </span>
                <span>{stats.rejectedApplications}</span>
              </div>
              <Progress 
                value={stats.totalApplications > 0 ? (stats.rejectedApplications / stats.totalApplications) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Raccourcis vers les fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/add-job">
                <Plus className="w-4 h-4 mr-2" />
                Publier une nouvelle offre
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/candidate-applications">
                <Users className="w-4 h-4 mr-2" />
                Voir toutes les candidatures
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/jobs">
                <Briefcase className="w-4 h-4 mr-2" />
                Gérer mes offres d'emploi
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Candidatures Section */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatures Reçues</CardTitle>
          <CardDescription>
            Gérez les candidatures pour vos offres d'emploi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecruiterApplicationsView dbUserId={dbUserId || undefined} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruiterDashboard;
