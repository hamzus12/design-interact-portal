
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserStatsProps {
  applications: any[];
  persona: any;
  matches: any[];
}

export function UserStats({ applications, persona, matches }: UserStatsProps) {
  const totalApplications = applications.length;
  const successfulApplications = applications.filter(app => app.is_submitted).length;
  const successRate = totalApplications > 0 ? (successfulApplications / totalApplications) * 100 : 0;
  
  const averageMatchScore = matches.length > 0 
    ? matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length 
    : 0;

  const topSkills = persona?.skills?.slice(0, 5) || [];
  const recentActivity = applications.slice(0, 3);

  const stats = [
    {
      title: 'Candidatures soumises',
      value: successfulApplications,
      total: totalApplications,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Score moyen de correspondance',
      value: Math.round(averageMatchScore),
      suffix: '%',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Taux de réussite',
      value: Math.round(successRate),
      suffix: '%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Compétences actives',
      value: topSkills.length,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}{stat.suffix || ''}
                      {stat.total && (
                        <span className="text-sm text-gray-500 ml-1">
                          / {stat.total}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Progression des compétences
            </CardTitle>
            <CardDescription>
              Vos compétences principales et leur développement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSkills.map((skill, index) => {
              const proficiency = 60 + (index * 8); // Simulation de niveau
              return (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{skill}</span>
                    <span className="text-sm text-gray-500">{proficiency}%</span>
                  </div>
                  <Progress value={proficiency} className="h-2" />
                </div>
              );
            })}
            {topSkills.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Ajoutez des compétences à votre JobPersona pour voir votre progression
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Vos dernières candidatures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((app, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    app.is_submitted ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{app.application_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <Badge variant={app.is_submitted ? 'default' : 'secondary'}>
                  {app.is_submitted ? 'Soumise' : 'Brouillon'}
                </Badge>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune activité récente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
