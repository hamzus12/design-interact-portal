
import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Calendar, 
  Bell,
  Search,
  Star,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const stats = [
    { icon: <Briefcase className="h-6 w-6" />, value: '12', label: 'Candidatures Actives', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: <Users className="h-6 w-6" />, value: '5', label: 'Entretiens Programmés', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: <TrendingUp className="h-6 w-6" />, value: '3', label: 'Offres Reçues', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: <Star className="h-6 w-6" />, value: '4.8', label: 'Score Profil', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  const recentActivities = [
    { type: 'application', title: 'Candidature envoyée', company: 'TechCorp Tunisia', time: '2h', status: 'en cours' },
    { type: 'interview', title: 'Entretien confirmé', company: 'Digital Solutions', time: '1j', status: 'programmé' },
    { type: 'offer', title: 'Offre reçue', company: 'StartupTN', time: '3j', status: 'nouveau' },
  ];

  const recommendedJobs = [
    { title: 'Développeur Frontend React', company: 'InnovTech', location: 'Tunis', salary: '2500-3500 TND', match: '95%' },
    { title: 'Designer UX/UI', company: 'CreativeStudio', location: 'Sfax', salary: '2000-3000 TND', match: '88%' },
    { title: 'Chef de Projet Digital', company: 'WebAgency', location: 'Sousse', salary: '3000-4000 TND', match: '82%' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-blob"></div>
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-8 lg:mb-0">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  <Bell className="w-4 h-4 mr-2" />
                  Tableau de Bord Personnel
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Bonjour, <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">{user.firstName}!</span>
                </h1>
                <p className="text-xl text-white/90 mb-6">
                  Gérez vos candidatures et découvrez de nouvelles opportunités
                </p>
                <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold px-8 py-3">
                  <Search className="w-5 h-5 mr-2" />
                  Rechercher des Emplois
                </Button>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-4xl font-bold text-gray-900">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <p className="text-white/80">Dernière connexion: Aujourd'hui</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="group hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                      <div className={stat.color}>
                        {stat.icon}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +12% ce mois
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Activités Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white mr-4">
                          {activity.type === 'application' && <Briefcase className="w-6 h-6" />}
                          {activity.type === 'interview' && <Users className="w-6 h-6" />}
                          {activity.type === 'offer' && <Star className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.company}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={activity.status === 'nouveau' ? 'default' : 'secondary'}>
                            {activity.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">il y a {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">
                    Voir Toutes les Activités
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Jobs */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Offres Recommandées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendedJobs.map((job, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            {job.match}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </div>
                          <div className="text-xs font-medium text-green-600">
                            {job.salary}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Voir Plus d'Offres
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6 shadow-lg border-0 bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Calendar className="w-4 h-4 mr-2" />
                      Planifier Entretien
                    </Button>
                    <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Users className="w-4 h-4 mr-2" />
                      Mettre à Jour Profil
                    </Button>
                    <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Bell className="w-4 h-4 mr-2" />
                      Paramètres Notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
