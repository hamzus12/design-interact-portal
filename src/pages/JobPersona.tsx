import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobPersona } from '@/context/JobPersonaContext';
import { useDatabase } from '@/context/DatabaseContext';
import { useJobAnalysis } from '@/hooks/useJobAnalysis';
import { useApplications } from '@/hooks/useApplications';
import { useConversation } from '@/hooks/useConversation';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { 
  Brain, CheckCircle2, Edit, PieChart, RefreshCcw, 
  Send, Star, XCircle, MessageSquare, FileText, 
  Briefcase, CheckCheck, Loader2
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const JobPersona = () => {
  const navigate = useNavigate();
  const { persona, isLoading, hasPersona } = useJobPersona();
  const { jobs, loading: loadingJobs, fetchJobs } = useDatabase();
  
  // Custom hooks for enhanced functionality
  const { 
    loadingMatches, 
    analyzingJob, 
    analyzeJobWithLoading, 
    calculateJobMatches 
  } = useJobAnalysis();
  
  const {
    generatingApplication,
    submittingApplication,
    loadingApplications,
    applications,
    generateApplicationWithLoading,
    submitApplicationWithLoading,
    loadApplications
  } = useApplications();

  const {
    messages,
    isResponding,
    initializeConversation,
    sendMessage,
    clearConversation
  } = useConversation();

  // Local state
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);

  // Dialog states
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [generatedApplication, setGeneratedApplication] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');

  useEffect(() => {
    if (!hasPersona) {
      navigate('/create-job-persona');
    }
  }, [hasPersona, navigate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Calculate job matches when jobs and persona are loaded
  useEffect(() => {
    const getMatches = async () => {
      if (!loadingJobs && jobs.length > 0 && persona) {
        const matches = await calculateJobMatches(jobs, persona);
        setJobMatches(matches);
      }
    };
    
    getMatches();
  }, [loadingJobs, jobs, persona, calculateJobMatches]);

  const handleAnalyzeJob = async (jobId: string) => {
    setSelectedJob(jobId);
    
    try {
      const analysis = await analyzeJobWithLoading(jobId);
      setJobAnalysis(analysis);
      
      // Update the job match in our local state
      setJobMatches(prev => prev.map(match => 
        match.id === jobId 
          ? { ...match, analysis, matchScore: analysis.score }
          : match
      ));
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleRefreshMatches = async () => {
    await fetchJobs();
    if (persona) {
      const matches = await calculateJobMatches(jobs, persona);
      setJobMatches(matches);
      
      toast({
        title: "Correspondances actualisées",
        description: "Vos correspondances d'emploi ont été mises à jour"
      });
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
      setJobMatches(prev => 
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
    const job = jobs.find(j => j.id.toString() === jobId);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Chargement de votre JobPersona...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!persona) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold">Aucun JobPersona trouvé</h2>
            <p className="mb-6">Vous n'avez pas encore créé votre avatar IA JobPersona.</p>
            <Button onClick={() => navigate('/create-job-persona')}>
              Créer un JobPersona
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const bestMatches = jobMatches.slice(0, 3);
  const otherMatches = jobMatches.slice(3);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Votre JobPersona IA</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/edit-job-persona')}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier le Profil
            </Button>
          </div>
          <p className="mt-2 text-gray-600">
            Votre assistant IA pour la recherche d'emploi qui travaille en votre nom
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* JobPersona profile summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profil JobPersona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Compétences Principales</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {persona.skills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Expérience</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {persona.experience.slice(0, 3).map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Préférences</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    {persona.preferences.jobTypes.length > 0 && (
                      <div>
                        <span className="font-medium">Types d'emploi :</span> {persona.preferences.jobTypes.join(', ')}
                      </div>
                    )}
                    {persona.preferences.locations.length > 0 && (
                      <div>
                        <span className="font-medium">Localisation :</span> {persona.preferences.locations.join(', ')}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Télétravail :</span> {persona.preferences.remote ? 'Oui' : 'Non'}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Progression de l'Apprentissage</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>Complétude du Profil</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>Données d'Apprentissage</span>
                        <span>{Math.min(jobMatches.length * 10, 100)}%</span>
                      </div>
                      <Progress value={Math.min(jobMatches.length * 10, 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/job-persona-stats')}>
                  <PieChart className="mr-2 h-4 w-4" />
                  Voir les Statistiques Détaillées
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="matches">
              <div className="mb-6 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="matches">Correspondances d'Emploi</TabsTrigger>
                  <TabsTrigger value="applications">Mes Candidatures</TabsTrigger>
                  <TabsTrigger value="learning">Apprentissage</TabsTrigger>
                </TabsList>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshMatches} 
                  disabled={loadingMatches}
                >
                  {loadingMatches ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="mr-2 h-4 w-4" />
                  )}
                  Actualiser
                </Button>
              </div>
              
              <TabsContent value="matches" className="mt-0">
                <div className="space-y-6">
                  {loadingMatches ? (
                    <Card>
                      <CardContent className="flex h-64 items-center justify-center">
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 animate-spin mb-4" />
                          <p className="text-sm text-gray-500">Analyse des correspondances d'emploi...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : jobMatches.length === 0 ? (
                    <Card>
                      <CardContent className="flex h-40 items-center justify-center text-center">
                        <div>
                          <p className="text-lg font-medium">Aucune correspondance trouvée</p>
                          <p className="mt-2 text-sm text-gray-500">
                            Nous n'avons trouvé aucun emploi correspondant à votre profil. Essayez d'ajuster vos préférences.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Best matches */}
                      {bestMatches.length > 0 && (
                        <div>
                          <h2 className="mb-3 text-lg font-semibold">Meilleures Correspondances</h2>
                          <div className="space-y-4">
                            {bestMatches.map((jobMatch) => (
                              <Card key={jobMatch.id} className={selectedJob === jobMatch.id ? 'border-primary' : ''}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-medium">{jobMatch.title}</h3>
                                      <p className="text-sm text-gray-500">{jobMatch.company}</p>
                                    </div>
                                    <Badge variant={jobMatch.matchScore >= 80 ? "default" : "outline"}>
                                      {jobMatch.matchScore}% Correspondance
                                    </Badge>
                                  </div>
                                  
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <Button 
                                      variant="secondary" 
                                      size="sm"
                                      onClick={() => handleAnalyzeJob(jobMatch.id)}
                                      disabled={analyzingJob === jobMatch.id}
                                    >
                                      {analyzingJob === jobMatch.id ? (
                                        <>
                                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                          Analyse...
                                        </>
                                      ) : (
                                        <>Analyser la Correspondance</>
                                      )}
                                    </Button>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleOpenConversation(jobMatch.id)}
                                    >
                                      <MessageSquare className="mr-1 h-4 w-4" />
                                      Simuler Entretien
                                    </Button>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleGenerateApplication(jobMatch.id)}
                                      disabled={generatingApplication}
                                    >
                                      {generatingApplication ? (
                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                      ) : (
                                        <FileText className="mr-1 h-4 w-4" />
                                      )}
                                      Générer Candidature
                                    </Button>
                                    
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      onClick={() => navigate(`/job/${jobMatch.id}`)}
                                    >
                                      <Briefcase className="mr-1 h-4 w-4" />
                                      Voir l'Emploi
                                    </Button>
                                  </div>
                                  
                                  {jobMatch.applied && (
                                    <div className="mt-3 flex items-center text-sm text-green-600">
                                      <CheckCheck className="mr-1 h-4 w-4" />
                                      Candidature soumise
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Other matches */}
                      {otherMatches.length > 0 && (
                        <div>
                          <h2 className="mb-3 text-lg font-semibold">Autres Correspondances</h2>
                          <Card>
                            <div className="divide-y">
                              {otherMatches.map((jobMatch) => (
                                <div key={jobMatch.id} className="flex items-center justify-between p-4">
                                  <div>
                                    <h3 className="font-medium">{jobMatch.title}</h3>
                                    <p className="text-sm text-gray-500">{jobMatch.company}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge>{jobMatch.matchScore}% Correspondance</Badge>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => navigate(`/job/${jobMatch.id}`)}
                                    >
                                      Voir
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="applications" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Candidatures Générées par l'IA</CardTitle>
                    <CardDescription>
                      Suivez vos candidatures automatisées et leur statut
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingApplications ? (
                      <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="flex h-40 items-center justify-center text-center">
                        <div>
                          <p className="text-lg font-medium">Aucune candidature pour le moment</p>
                          <p className="mt-2 text-sm text-gray-500">
                            Votre IA n'a pas encore envoyé de candidatures. Analysez les correspondances d'emploi pour commencer.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((app) => (
                          <div key={app.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">{app.jobs?.title}</h3>
                                <p className="text-sm text-gray-500">{app.jobs?.company}</p>
                                <p className="text-xs text-gray-400">
                                  Généré le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={app.is_submitted ? "default" : "secondary"}>
                                  {app.is_submitted ? "Soumise" : "Brouillon"}
                                </Badge>
                                <Button variant="outline" size="sm">
                                  Voir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="learning" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Progression de l'Apprentissage</CardTitle>
                    <CardDescription>
                      Voyez comment votre JobPersona IA apprend et s'améliore
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-2 text-sm font-medium">Apprentissage par Rétroaction</h3>
                        <Progress value={persona.learningProfile?.feedback?.length ? persona.learningProfile.feedback.length * 5 : 0} className="h-2" />
                        <p className="mt-1 text-xs text-gray-500">
                          {persona.learningProfile?.feedback?.length || 0} éléments de rétroaction collectés
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="mb-2 text-sm font-medium">Historique des Candidatures</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border bg-card p-3 text-center">
                            <p className="text-2xl font-bold text-primary">
                              {applications.filter(app => app.is_submitted).length}
                            </p>
                            <p className="text-xs text-gray-500">Soumises</p>
                          </div>
                          <div className="rounded-lg border bg-card p-3 text-center">
                            <p className="text-2xl font-bold text-muted-foreground">
                              {jobMatches.length}
                            </p>
                            <p className="text-xs text-gray-500">Correspondances Analysées</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Job analysis section */}
            {selectedJob && jobAnalysis && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Analyse de Correspondance d'Emploi</CardTitle>
                  <CardDescription>
                    Analyse détaillée de la correspondance entre votre profil et cet emploi
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
                <CardFooter className="flex flex-wrap gap-2">
                  <Button onClick={() => handleGenerateApplication(selectedJob)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Générer Candidature
                  </Button>
                  
                  <Button variant="outline" onClick={() => handleOpenConversation(selectedJob)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Simuler Entretien
                  </Button>
                  
                  <Button variant="secondary" onClick={() => navigate(`/job/${selectedJob}`)}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Voir Détails Complets
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Generated Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidature Générée</DialogTitle>
            <DialogDescription>
              Examinez et modifiez votre candidature générée par l'IA avant de la soumettre
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Textarea 
              className="h-[300px] font-mono text-sm"
              value={generatedApplication}
              onChange={(e) => setGeneratedApplication(e.target.value)}
              placeholder="Votre candidature apparaîtra ici..."
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
            <DialogTitle>Simulation d'Entretien</DialogTitle>
            <DialogDescription>
              Entraînez-vous à vos compétences d'entretien avec un recruteur IA
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
                    <span>Le recruteur réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Textarea
              placeholder="Posez une question..."
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
};

export default JobPersona;
