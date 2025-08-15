
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileForm from '@/components/Profile/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Briefcase, 
  Award, 
  Settings, 
  Upload,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const profileCompleteness = () => {
    if (!profile) return 0;
    let completeness = 0;
    const fields = ['full_name', 'bio', 'location', 'phone', 'skills', 'experience'];
    
    fields.forEach(field => {
      if (profile[field] && profile[field].toString().trim() !== '') {
        completeness += 100 / fields.length;
      }
    });
    
    return Math.round(completeness);
  };

  const achievements = [
    { icon: <Award className="h-5 w-5" />, title: 'Profil Vérifié', description: 'Compte authentifié', earned: true },
    { icon: <Star className="h-5 w-5" />, title: 'Top Candidat', description: 'Dans le top 10%', earned: false },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'Profil Actif', description: '90% de complétude', earned: profileCompleteness() >= 90 },
    { icon: <Eye className="h-5 w-5" />, title: 'Profil Populaire', description: '100+ vues ce mois', earned: false },
  ];

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <User className="h-4 w-4" /> },
    { id: 'experience', label: 'Expérience', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'achievements', label: 'Badges', icon: <Award className="h-4 w-4" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-8 lg:mb-0 flex-1">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  <Shield className="w-4 h-4 mr-2" />
                  Profil Personnel
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Gérez Votre 
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Profil</span>
                </h1>
                <p className="text-xl text-white/90 mb-6 max-w-2xl">
                  Optimisez votre profil pour attirer les meilleures opportunités
                </p>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto lg:mx-0">
                  <span className="text-4xl font-bold text-gray-900">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <p className="text-white/80 mb-2">Complétude du Profil</p>
                <div className="w-32 mx-auto lg:mx-0">
                  <Progress value={profileCompleteness()} className="bg-white/20" />
                  <p className="text-sm text-white/80 mt-1">{profileCompleteness()}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">156</h3>
              <p className="text-gray-600">Vues du Profil</p>
            </Card>
            
            <Card className="text-center p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
              <p className="text-gray-600">Candidatures</p>
            </Card>
            
            <Card className="text-center p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
              <p className="text-gray-600">Score Profil</p>
            </Card>
            
            <Card className="text-center p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">3</h3>
              <p className="text-gray-600">Badges Obtenus</p>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center mb-8 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'profile' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Informations Personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm profile={profile} onUpdate={setProfile} />
                  </CardContent>
                </Card>
              )}

              {activeTab === 'achievements' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Award className="w-5 h-5 mr-2 text-purple-600" />
                      Badges et Réalisations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            achievement.earned
                              ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                        >
                          <div className={`inline-flex p-2 rounded-full mb-3 ${
                            achievement.earned 
                              ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                              : 'bg-gray-300 text-gray-500'
                          }`}>
                            {achievement.icon}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.earned && (
                            <Badge className="mt-2 bg-green-500 text-white">Obtenu</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'experience' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                      Expérience Professionnelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ajoutez votre expérience</h3>
                      <p className="text-gray-600 mb-6">Partagez votre parcours professionnel pour attirer les recruteurs</p>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Upload className="w-4 h-4 mr-2" />
                        Ajouter une Expérience
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'settings' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Settings className="w-5 h-5 mr-2 text-orange-600" />
                      Paramètres du Compte
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Notifications</h4>
                        <p className="text-gray-600 text-sm mb-4">Gérez vos préférences de notification</p>
                        <Button variant="outline">Configurer</Button>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Confidentialité</h4>
                        <p className="text-gray-600 text-sm mb-4">Contrôlez la visibilité de votre profil</p>
                        <Button variant="outline">Modifier</Button>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Sécurité</h4>
                        <p className="text-gray-600 text-sm mb-4">Mettez à jour vos informations de sécurité</p>
                        <Button variant="outline">Sécuriser</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileHeader profile={profile} />
              
              {/* Quick Tips */}
              <Card className="mt-6 shadow-lg border-0 bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle>💡 Conseils Profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p>• Complétez votre profil à 100%</p>
                    <p>• Ajoutez des mots-clés pertinents</p>
                    <p>• Mettez à jour régulièrement</p>
                    <p>• Ajoutez une photo professionnelle</p>
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

export default Profile;
