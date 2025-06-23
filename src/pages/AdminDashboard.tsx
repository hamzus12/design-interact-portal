
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useUserRole } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  Shield,
  BarChart3,
  TrendingUp,
  UserCheck,
  Building
} from 'lucide-react';
import ManageUsers from './ManageUsers';
import AdminJobsManager from '@/components/Admin/AdminJobsManager';
import AdminStats from '@/components/Admin/AdminStats';

const AdminDashboard = () => {
  const { role, user, isLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    flaggedJobs: 0,
    totalApplications: 0,
    newUsersThisMonth: 0,
    activeJobs: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && role !== 'admin') {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent accéder à cette page",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    
    if (role === 'admin') {
      fetchStats();
    }
  }, [role, isLoading, navigate, toast]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      
      // Récupérer les statistiques
      const [usersRes, jobsRes, appsRes] = await Promise.all([
        supabase.from('users').select('id, created_at'),
        supabase.from('jobs').select('id, is_flagged, is_active'),
        supabase.from('applications').select('id')
      ]);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalJobs: jobsRes.data?.length || 0,
        flaggedJobs: jobsRes.data?.filter(job => job.is_flagged).length || 0,
        totalApplications: appsRes.data?.length || 0,
        newUsersThisMonth: usersRes.data?.filter(user => 
          new Date(user.created_at) >= thisMonthStart
        ).length || 0,
        activeJobs: jobsRes.data?.filter(job => job.is_active).length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoadingStats(false);
    }
  };

  if (isLoading) {
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

  if (role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-600" />
                Tableau de Bord Administrateur
              </h1>
              <p className="text-gray-600">
                Gérez les utilisateurs, les offres d'emploi et surveillez l'activité de la plateforme
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Utilisateurs Total</p>
                  <p className="text-3xl font-bold">{loadingStats ? '-' : stats.totalUsers}</p>
                  <p className="text-xs text-green-600">
                    +{loadingStats ? '-' : stats.newUsersThisMonth} ce mois
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Offres d'Emploi</p>
                  <p className="text-3xl font-bold">{loadingStats ? '-' : stats.totalJobs}</p>
                  <p className="text-xs text-blue-600">
                    {loadingStats ? '-' : stats.activeJobs} actives
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Offres Signalées</p>
                  <p className="text-3xl font-bold text-red-600">
                    {loadingStats ? '-' : stats.flaggedJobs}
                  </p>
                  <p className="text-xs text-red-600">Nécessitent attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Candidatures</p>
                  <p className="text-3xl font-bold">{loadingStats ? '-' : stats.totalApplications}</p>
                  <p className="text-xs text-gray-600">Total soumises</p>
                </div>
                <UserCheck className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gestion Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Gestion Emplois
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <ManageUsers />
          </TabsContent>

          <TabsContent value="jobs">
            <AdminJobsManager />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
