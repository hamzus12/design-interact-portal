
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserStats } from '@/components/Dashboard/UserStats';
import { FeedbackForm } from '@/components/Feedback/FeedbackForm';
import { useAuth } from '@/context/AuthContext';
import { useJobPersona } from '@/context/JobPersonaContext';
import { useApplications } from '@/hooks/useApplications';
import { useJobAnalysis } from '@/hooks/useJobAnalysis';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  User, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  Plus,
  TrendingUp,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { persona, hasPersona } = useJobPersona();
  const { applications, loadApplications } = useApplications();
  const { calculateJobMatches } = useJobAnalysis();
  const { success } = useNotifications();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!hasPersona) {
        setIsLoading(false);
        return;
      }

      try {
        await loadApplications();
        
        // Simulate job matches for demo
        const demoMatches = [
          { id: '1', matchScore: 85, title: 'Développeur React', company: 'TechCorp' },
          { id: '2', matchScore: 78, title: 'Frontend Developer', company: 'StartupXYZ' },
          { id: '3', matchScore: 92, title: 'UI/UX Developer', company: 'DesignHub' },
        ];
        setMatches(demoMatches);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [hasPersona, loadApplications]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasPersona) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <User className="w-6 h-6" />
                Bienvenue sur votre tableau de bord !
              </CardTitle>
              <CardDescription>
                Créez votre JobPersona IA pour commencer à découvrir des opportunités personnalisées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Votre JobPersona IA vous aidera à analyser les offres d'emploi, générer des candidatures 
                personnalisées et simuler des entretiens.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/create-job-persona">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer mon JobPersona
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/jobs">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Parcourir les emplois
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Gérez vos candidatures et suivez votre progression
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Candidatures
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Correspondances
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <UserStats 
              applications={applications} 
              persona={persona} 
              matches={matches} 
            />
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Mes candidatures</CardTitle>
                <CardDescription>
                  Gérez vos candidatures générées et soumises
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{app.application_type}</h3>
                            <p className="text-sm text-gray-500">
                              Créée le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Voir
                            </Button>
                            {!app.is_submitted && (
                              <Button size="sm">
                                Soumettre
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucune candidature générée pour le moment</p>
                    <Button asChild>
                      <Link to="/jobs">
                        Parcourir les emplois
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Correspondances d'emploi</CardTitle>
                <CardDescription>
                  Emplois correspondant à votre profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div key={match.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{match.title}</h3>
                            <p className="text-sm text-gray-500">{match.company}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Correspondance</p>
                              <p className="text-lg font-bold text-blue-600">{match.matchScore}%</p>
                            </div>
                            <Button size="sm">
                              Voir l'offre
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune correspondance trouvée pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="max-w-2xl mx-auto">
              <FeedbackForm 
                onSubmit={() => {
                  success({ 
                    title: 'Merci !', 
                    description: 'Votre feedback nous aide à améliorer l\'expérience' 
                  });
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
