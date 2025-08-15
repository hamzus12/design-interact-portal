
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase,
  UserCheck,
  AlertTriangle 
} from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalJobs: number;
    flaggedJobs: number;
    totalApplications: number;
    newUsersThisMonth: number;
    activeJobs: number;
  };
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const flaggedPercentage = stats.totalJobs > 0 ? (stats.flaggedJobs / stats.totalJobs) * 100 : 0;
  const activeJobsPercentage = stats.totalJobs > 0 ? (stats.activeJobs / stats.totalJobs) * 100 : 0;
  const applicationRate = stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistiques Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Utilisateurs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Croissance Utilisateurs</span>
              </div>
              <span className="text-sm text-gray-500">
                {stats.newUsersThisMonth} nouveaux ce mois
              </span>
            </div>
            <Progress 
              value={stats.totalUsers > 0 ? (stats.newUsersThisMonth / stats.totalUsers) * 100 : 0} 
              className="h-2" 
            />
          </div>

          {/* Offres d'emploi actives */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-500" />
                <span className="font-medium">Offres Actives</span>
              </div>
              <span className="text-sm text-gray-500">
                {activeJobsPercentage.toFixed(1)}% du total
              </span>
            </div>
            <Progress value={activeJobsPercentage} className="h-2" />
          </div>

          {/* Taux de candidature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Taux de Candidature</span>
              </div>
              <span className="text-sm text-gray-500">
                {applicationRate.toFixed(1)} candidatures/offre
              </span>
            </div>
            <Progress value={Math.min(applicationRate * 10, 100)} className="h-2" />
          </div>

          {/* Offres signalées */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium">Offres Signalées</span>
              </div>
              <span className="text-sm text-gray-500">
                {flaggedPercentage.toFixed(1)}% du total
              </span>
            </div>
            <Progress 
              value={flaggedPercentage} 
              className="h-2" 
              // @ts-ignore
              indicatorClassName={flaggedPercentage > 5 ? "bg-red-500" : "bg-yellow-500"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grille de métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Engagement Plateforme</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Utilisateurs totaux</span>
                <span className="font-medium">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Nouveaux ce mois</span>
                <span className="font-medium text-green-600">+{stats.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Candidatures totales</span>
                <span className="font-medium">{stats.totalApplications}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Qualité du Contenu</h3>
              <AlertTriangle className={`w-5 h-5 ${flaggedPercentage > 5 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Offres totales</span>
                <span className="font-medium">{stats.totalJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Offres signalées</span>
                <span className={`font-medium ${stats.flaggedJobs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.flaggedJobs}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taux de signalement</span>
                <span className={`font-medium ${flaggedPercentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {flaggedPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
