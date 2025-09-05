import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserStats } from '@/components/Dashboard/UserStats';
import { FeedbackForm } from '@/components/Feedback/FeedbackForm';
import RecruiterDashboard from '@/components/Dashboard/RecruiterDashboard';
import { useAuth } from '@/context/AuthContext';
import { useJobPersona } from '@/context/JobPersonaContext';
import { useApplications } from '@/hooks/useApplications';
import { useJobAnalysis } from '@/hooks/useJobAnalysis';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useConversation } from '@/hooks/useConversation';
import { useDatabase } from '@/context/DatabaseContext';
import { useUserRole } from '@/context/UserContext';
import { 
  User, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  Plus,
  TrendingUp,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  Star,
  FileText,
  Send,
  Loader2,
  RefreshCcw,
  Edit,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const { role, isLoading } = useUserRole();
  const { persona, hasPersona } = useJobPersona();
  const { applications, loadApplications } = useApplications();
  const { calculateJobMatches } = useJobAnalysis();
  const { success } = useToastNotifications();
  const { jobs, loading: loadingJobs, fetchJobs } = useDatabase();

  // TOUS LES HOOKS DOIVENT ÊTRE APPELÉS ICI EN PREMIER
  const { 
    loadingMatches, 
    analyzingJob, 
    analyzeJobWithLoading, 
  } = useJobAnalysis();
  
  const {
    generatingApplication,
    submittingApplication,
    generateApplicationWithLoading,
    submitApplicationWithLoading,
  } = useApplications();

  const {
    messages,
    isResponding,
    initializeConversation,
    sendMessage,
    clearConversation
  } = useConversation();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);

  // Dialog states
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [generatedApplication, setGeneratedApplication] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  
  // Wait for role to load before rendering anything
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div>
                <p className="text-lg font-medium">Chargement du tableau de bord...</p>
                <p className="text-sm text-muted-foreground">Vérification de vos permissions</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If user is a recruiter, show recruiter dashboard
  if (role === 'recruiter' || role === 'admin') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <RecruiterDashboard />
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!hasPersona) {
        setIsDashboardLoading(false);
        return;
      }

      try {
        await loadApplications();
        await fetchJobs();
        
        // Calculate job matches using real data
        if (jobs.length > 0 && persona) {
          const jobMatches = await calculateJobMatches(jobs, persona);
          setMatches(jobMatches);
        } else {
          // Fallback demo matches
          const demoMatches = [
            { id: '1', matchScore: 85, title: 'Développeur React', company: 'TechCorp' },
            { id: '2', matchScore: 78, title: 'Frontend Developer', company: 'StartupXYZ' },
            { id: '3', matchScore: 92, title: 'UI/UX Developer', company: 'DesignHub' },
          ];
          setMatches(demoMatches);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, [hasPersona, loadApplications, fetchJobs, jobs, persona, calculateJobMatches]);

  const handleAnalyzeJob = async (jobId: string) => {
    setSelectedJob(jobId);
    
    try {
      const analysis = await analyzeJobWithLoading(jobId);
      setJobAnalysis(analysis);
      
      // Update the job match in our local state
      setMatches(prev => prev.map(match => 
        match.id === jobId 
          ? { ...match, analysis, matchScore: analysis.score }
          : match
      ));
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleGenerateApplication = async (jobId: string) => {
    try {
      const content = await generateApplicationWithLoading(jobId);
      setGeneratedApplication(content);
      setSelectedJob(jobId);
      setApplicationDialogOpen(true);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;
    
    const success = await submitApplicationWithLoading(selectedJob, generatedApplication);
    
    if (success) {
      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === selectedJob 
            ? { ...match, applied: true } 
            : match
        )
      );
      
      setApplicationDialogOpen(false);
      setGeneratedApplication('');
    }
  };

  const handleOpenConversation = (jobId: string) => {
    const job = jobs.find(j => j.id.toString() === jobId) || matches.find(m => m.id === jobId);
    if (job) {
      setSelectedJob(jobId);
      clearConversation();
      initializeConversation(job.title, job.company);
      setConversationDialogOpen(true);
    }
  };

  const handleSendQuestion = async () => {
    if (!currentQuestion.trim() || !selectedJob) return;
    
    await sendMessage(selectedJob, currentQuestion);
    setCurrentQuestion('');
  };

  const handleRefreshMatches = async () => {
    await fetchJobs();
    if (persona && jobs.length > 0) {
      const jobMatches = await calculateJobMatches(jobs, persona);
      setMatches(jobMatches);
      
      toast({
        title: "Correspondances actualisées",
        description: "Vos correspondances d'emploi ont été mises à jour"
      });
    }
  };

  if (isDashboardLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de votre tableau de bord...</p>
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

  const bestMatches = matches.slice(0, 3);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                Tableau de bord IA
              </h1>
              <p className="text-gray-600">
                Votre assistant intelligent pour la recherche d'emploi
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshMatches} disabled={loadingMatches}>
                {loadingMatches ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2" />
                )}
                Actualiser
              </Button>
              <Button variant="outline" asChild>
                <Link to="/edit-job-persona">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier Profil
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Correspondances
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Candidatures
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analyses IA
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Correspondances</p>
                      <p className="text-3xl font-bold">{matches.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Candidatures</p>
                      <p className="text-3xl font-bold">{applications.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Score Moyen</p>
                      <p className="text-3xl font-bold">
                        {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.matchScore, 0) / matches.length) : 0}%
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Profil Complété</p>
                      <p className="text-3xl font-bold">85%</p>
                    </div>
                    <User className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <UserStats 
              applications={applications} 
              persona={persona} 
              matches={matches} 
            />
            
            {/* Actions rapides */}
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-blue-600" />
                  Actions rapides
                </CardTitle>
                <CardDescription>
                  Optimisez votre recherche d'emploi avec nos outils IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    asChild 
                    className="h-auto p-4 flex flex-col items-start bg-white hover:bg-gray-50 text-left border"
                    variant="outline"
                  >
                    <Link to="/interview-practice">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Simulation d'entretien</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pratiquez vos entretiens avec notre IA spécialisée
                      </p>
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    className="h-auto p-4 flex flex-col items-start bg-white hover:bg-gray-50 text-left border"
                    variant="outline"
                  >
                    <Link to="/jobs">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">Découvrir des emplois</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Parcourez les dernières offres d'emploi
                      </p>
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    className="h-auto p-4 flex flex-col items-start bg-white hover:bg-gray-50 text-left border"
                    variant="outline"
                  >
                    <Link to="/edit-job-persona">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold">Améliorer le profil</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Optimisez votre JobPersona IA
                      </p>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Correspondances d'emploi IA</CardTitle>
                <CardDescription>
                  Emplois analysés et classés par votre assistant IA - Chaque emploi avec son score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMatches ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-4" />
                      <p className="text-sm text-gray-500">Analyse des correspondances d'emploi...</p>
                    </div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((match) => (
                      <Card key={match.id} className="border hover:border-primary transition-colors">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* En-tête avec titre et score */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{match.title}</h3>
                                <p className="text-gray-600 mb-2">{match.company}</p>
                                <p className="text-sm text-gray-500">{match.location || 'Localisation non spécifiée'}</p>
                              </div>
                              <div className="ml-4">
                                <Badge 
                                  variant={match.matchScore >= 80 ? "default" : "outline"}
                                  className="text-lg px-3 py-1"
                                >
                                  {match.matchScore}%
                                </Badge>
                              </div>
                            </div>

                            {/* Barre de progression pour le score */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Score de correspondance</span>
                                <span className="font-medium">{match.matchScore}%</span>
                              </div>
                              <Progress value={match.matchScore} className="h-2" />
                            </div>

                            {/* Actions - Sans planification d'entretien */}
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => handleAnalyzeJob(match.id)}
                                disabled={analyzingJob === match.id}
                                className="flex-1"
                              >
                                {analyzingJob === match.id ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Analyse...
                                  </>
                                ) : (
                                  <>
                                    <Brain className="mr-1 h-4 w-4" />
                                    Analyser
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleGenerateApplication(match.id)}
                                disabled={generatingApplication}
                                className="flex-1"
                              >
                                {generatingApplication ? (
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                ) : (
                                  <FileText className="mr-1 h-4 w-4" />
                                )}
                                Candidature
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => window.open(`/job/${match.id}`, '_blank')}
                                className="flex-1"
                              >
                                <Briefcase className="mr-1 h-4 w-4" />
                                Voir l'Emploi
                              </Button>
                            </div>
                            
                            {/* Statut de candidature */}
                            {match.applied && (
                              <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Candidature soumise
                              </div>
                            )}
                            
                            {/* Analyse IA détaillée */}
                            {jobAnalysis && selectedJob === match.id && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                <h4 className="font-medium mb-3 flex items-center">
                                  <Brain className="mr-2 h-4 w-4" />
                                  Analyse IA Détaillée
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Score final:</span> 
                                    <Badge variant="outline">{jobAnalysis.score}%</Badge>
                                  </div>
                                  
                                  {jobAnalysis.strengths?.length > 0 && (
                                    <div>
                                      <span className="font-medium text-green-600 flex items-center mb-2">
                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                        Points forts
                                      </span>
                                      <ul className="ml-4 space-y-1 text-green-700">
                                        {jobAnalysis.strengths.map((strength: string, index: number) => (
                                          <li key={index} className="flex items-start">
                                            <span className="mr-2 text-green-500">•</span>
                                            {strength}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {jobAnalysis.weaknesses?.length > 0 && (
                                    <div>
                                      <span className="font-medium text-orange-600 flex items-center mb-2">
                                        <XCircle className="mr-1 h-4 w-4" />
                                        Points d'amélioration
                                      </span>
                                      <ul className="ml-4 space-y-1 text-orange-700">
                                        {jobAnalysis.weaknesses.map((weakness: string, index: number) => (
                                          <li key={index} className="flex items-start">
                                            <span className="mr-2 text-orange-500">•</span>
                                            {weakness}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {jobAnalysis.recommendation && (
                                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                      <span className="font-medium text-blue-700 flex items-center mb-1">
                                        <Star className="mr-1 h-4 w-4" />
                                        Recommandation IA
                                      </span>
                                      <p className="text-blue-700">{jobAnalysis.recommendation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucune correspondance trouvée pour le moment</p>
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

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Candidatures générées par IA</CardTitle>
                <CardDescription>
                  Gérez vos candidatures générées automatiquement
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

          <TabsContent value="analysis">
            {selectedJob && jobAnalysis ? (
              <Card>
                <CardHeader>
                  <CardTitle>Analyse IA de Correspondance</CardTitle>
                  <CardDescription>
                    Analyse détaillée générée par l'intelligence artificielle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-20 w-20">
                      <div className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-primary">
                        <span className="text-lg font-bold">{jobAnalysis.score}%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {jobAnalysis.score >= 80 ? 'Excellente Correspondance' : 
                         jobAnalysis.score >= 60 ? 'Bonne Correspondance' : 'Correspondance Correcte'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {jobAnalysis.recommendation}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 flex items-center font-medium">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Points Forts
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {jobAnalysis.strengths.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <Star className="mr-2 h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" /> 
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="mb-2 flex items-center font-medium">
                        <XCircle className="mr-2 h-5 w-5 text-red-500" /> Points à Améliorer
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {jobAnalysis.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2 text-gray-400 flex-shrink-0">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">Aucune analyse disponible</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Analysez une correspondance d'emploi pour voir les détails ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feedback">
            <div className="max-w-2xl mx-auto">
              <FeedbackForm 
                onSubmit={() => {
                  success({ 
                    title: 'Merci !', 
                    description: 'Votre feedback nous aide à améliorer l\'expérience IA' 
                  });
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Generated Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lettre de Motivation Générée par IA</DialogTitle>
            <DialogDescription>
              Examinez et modifiez votre lettre générée par l'intelligence artificielle
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Textarea 
              className="h-[300px] font-mono text-sm"
              value={generatedApplication}
              onChange={(e) => setGeneratedApplication(e.target.value)}
              placeholder="Votre lettre de motivation apparaîtra ici..."
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitApplication}
              disabled={submittingApplication || !generatedApplication.trim()}
            >
              {submittingApplication ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission...
                </>
              ) : (
                'Soumettre la Candidature'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Conversation Simulator Dialog */}
      <Dialog open={conversationDialogOpen} onOpenChange={setConversationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulation d'Entretien IA</DialogTitle>
            <DialogDescription>
              Entraînez-vous avec un recruteur virtuel intelligent
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 h-[300px] overflow-y-auto rounded-md border p-4">
            {messages.map((message, index) => (
              message.role !== 'system' && (
                <div 
                  key={index} 
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              )
            ))}
            
            {isResponding && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Le recruteur IA réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Textarea
              placeholder="Posez une question ou répondez..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendQuestion();
                }
              }}
              disabled={isResponding}
              className="flex-1 min-h-[40px] max-h-[100px]"
            />
            <Button 
              size="icon"
              onClick={handleSendQuestion}
              disabled={!currentQuestion.trim() || isResponding}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
