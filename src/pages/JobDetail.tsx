
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/context/UserContext';
import { useJobPersona } from '@/context/JobPersonaContext';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Heart, 
  Share, 
  MessageSquare,
  FileText,
  Brain,
  Star
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { chatService } from '@/services/ChatService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getJobById, toggleFavorite, favorites, submitApplication } = useDatabase();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { persona, analyzeJobMatch, generateApplication } = useJobPersona();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  
  // JobPersona features
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);
  const [analyzingJob, setAnalyzingJob] = useState<boolean>(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterDialogOpen, setCoverLetterDialogOpen] = useState(false);

  // Helper function to get database user ID from auth user ID
  const getDatabaseUserId = async (authUserId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUserId)
        .single();
      
      if (error || !data) {
        console.error('Error getting database user ID:', error);
        return null;
      }
      
      return data.id;
    } catch (err) {
      console.error('Error getting database user ID:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadJob = async () => {
      try {
        if (id) {
          const jobData = await getJobById(id);
          setJob(jobData);
          
          // Auto-analyze job if user has JobPersona
          if (persona && jobData) {
            handleAnalyzeJob();
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, getJobById, persona]);

  // Check if job is in favorites when favorites or job changes
  useEffect(() => {
    if (job && favorites) {
      setIsFavorite(favorites.includes(job.id));
    }
  }, [favorites, job]);

  const handleToggleFavorite = () => {
    if (job) {
      toggleFavorite(job.id);
    }
  };

  const handleAnalyzeJob = async () => {
    if (!persona || !id) return;
    
    setAnalyzingJob(true);
    
    try {
      const analysis = await analyzeJobMatch(id);
      setJobAnalysis(analysis);
    } catch (error) {
      console.error("Error analyzing job:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser la correspondance avec ce poste.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingJob(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!persona || !id) {
      toast({
        title: "JobPersona requis",
        description: "Vous devez créer votre JobPersona pour générer une lettre de motivation.",
        variant: "destructive"
      });
      navigate('/create-job-persona');
      return;
    }
    
    setGeneratingCoverLetter(true);
    
    try {
      const coverLetter = await generateApplication(id);
      if (coverLetter) {
        setGeneratedCoverLetter(coverLetter);
        setCoverLetterDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la lettre de motivation.",
        variant: "destructive"
      });
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleApplyClick = async () => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez vous connecter pour postuler.",
        variant: "destructive",
      });
      navigate('/signin', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (role !== 'candidate') {
      toast({
        title: "Action non autorisée",
        description: "Seuls les candidats peuvent postuler aux emplois.",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplying(true);
      await submitApplication(job.id);
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès.",
      });
      navigate('/my-applications');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'envoi de la candidature.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleContactRecruiter = async () => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez vous connecter pour contacter le recruteur.",
        variant: "destructive",
      });
      navigate('/signin', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (role !== 'candidate') {
      toast({
        title: "Action non autorisée",
        description: "Seuls les candidats peuvent contacter les recruteurs.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if job has a recruiter_id
      if (!job.recruiterId && !job.recruiter_id) {
        toast({
          title: "Contact non disponible",
          description: "Les informations de contact du recruteur ne sont pas disponibles.",
          variant: "destructive",
        });
        return;
      }

      // Get database user ID for the candidate
      const candidateDbId = await getDatabaseUserId(user.id);
      if (!candidateDbId) {
        toast({
          title: "Erreur",
          description: "Impossible de trouver votre profil utilisateur.",
          variant: "destructive",
        });
        return;
      }

      // Create or find existing conversation using database user IDs
      const conversation = await chatService.createConversation(
        job.id, 
        candidateDbId,
        job.recruiterId || job.recruiter_id
      );
      
      // Navigate to the conversation
      navigate(`/chat/${conversation.id}`);
      
      toast({
        title: "Conversation démarrée",
        description: "Vous pouvez maintenant discuter avec le recruteur.",
      });
    } catch (error: any) {
      console.error('Contact recruiter error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la conversation avec le recruteur.",
        variant: "destructive",
      });
    }
  };

  const handleShareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Lien copié",
      description: "Le lien de l'emploi a été copié dans le presse-papiers.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/30">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Emploi introuvable</h2>
            <p className="mt-2 text-red-600 dark:text-red-300">{error || "L'emploi demandé n'existe pas ou a été supprimé."}</p>
            <Button asChild className="mt-4">
              <Link to="/jobs">Voir tous les emplois</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Job header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="md:flex md:items-start md:justify-between">
            <div className="md:flex md:items-start md:space-x-6">
              <div className={`flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white`}>
                {job?.company?.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="mt-4 text-2xl font-bold md:mt-0">{job?.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Building className="mr-1 h-4 w-4" />
                    {job?.company}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job?.location}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="mr-1 h-4 w-4" />
                    {job?.timeAgo || 'Récemment'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2 md:mt-0">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleToggleFavorite}
                className="rounded-full"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : 'text-gray-500'}`} />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleShareJob}
                className="rounded-full"
              >
                <Share className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                {job?.jobType || job?.type || job?.job_type}
              </Badge>
              
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                {job?.category}
              </Badge>
              
              {(job?.salaryRange || job?.salary_range) && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                  {job?.salaryRange || job?.salary_range}
                </Badge>
              )}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Button 
                onClick={handleApplyClick}
                disabled={applying || role !== 'candidate'}
                className="bg-primary hover:bg-primary/90"
              >
                {applying ? "Envoi en cours..." : "Postuler maintenant"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleContactRecruiter}
                disabled={role !== 'candidate'}
                className="flex items-center"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contacter le recruteur
              </Button>

              {persona && (
                <Button 
                  variant="outline" 
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCoverLetter}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {generatingCoverLetter ? "Génération..." : "Générer lettre de motivation"}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* JobPersona Analysis Section */}
        {persona && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" />
                  Analyse JobPersona AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyzingJob ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="ml-3">Analyse en cours...</span>
                  </div>
                ) : jobAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16">
                        <div className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-primary">
                          <span className="text-lg font-bold">{jobAnalysis.score}%</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {jobAnalysis.score >= 80 ? 'Excellente correspondance' : 
                           jobAnalysis.score >= 60 ? 'Bonne correspondance' : 
                           'Correspondance correcte'}
                        </h3>
                        <p className="text-sm text-gray-600">{jobAnalysis.recommendation}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Points forts</h4>
                        <ul className="space-y-1">
                          {jobAnalysis.strengths.map((strength: string, i: number) => (
                            <li key={i} className="flex items-start text-sm">
                              <Star className="mr-2 h-3 w-3 text-green-500 mt-0.5" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-orange-700 mb-2">À améliorer</h4>
                        <ul className="space-y-1">
                          {jobAnalysis.weaknesses.map((weakness: string, i: number) => (
                            <li key={i} className="flex items-start text-sm">
                              <span className="mr-2 text-orange-500 mt-0.5">•</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button onClick={handleAnalyzeJob} variant="outline">
                      <Brain className="mr-2 h-4 w-4" />
                      Analyser la correspondance
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Job details */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="text-xl font-semibold">Description du poste</h2>
              <div className="prose mt-4 max-w-none dark:prose-invert">
                <p>{job.description}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="text-lg font-semibold">Détails du poste</h2>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <Calendar className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Type de poste</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.jobType || job.type || job.job_type}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Briefcase className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Catégorie</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.category}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Localisation</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.location}</p>
                  </div>
                </div>
                
                {(job.salaryRange || job.salary_range) && (
                  <div className="flex items-start">
                    <DollarSign className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">Salaire</h3>
                      <p className="text-gray-600 dark:text-gray-300">{job.salaryRange || job.salary_range}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Building className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Entreprise</h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Postuler à cette offre</h3>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Envoyez votre candidature maintenant pour rejoindre {job.company} en tant que {job.title}.
              </p>
              <Button 
                className="mt-4 w-full bg-primary hover:bg-primary/90"
                onClick={handleApplyClick}
                disabled={applying || (role === 'recruiter' || role === 'admin')}
              >
                {applying ? "Envoi en cours..." : "Postuler maintenant"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Letter Dialog */}
      <Dialog open={coverLetterDialogOpen} onOpenChange={setCoverLetterDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lettre de motivation générée</DialogTitle>
            <DialogDescription>
              Votre lettre de motivation personnalisée pour ce poste
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Textarea 
              className="h-[300px] font-mono"
              value={generatedCoverLetter}
              onChange={(e) => setGeneratedCoverLetter(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCoverLetterDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              navigator.clipboard.writeText(generatedCoverLetter);
              toast({
                title: "Copié",
                description: "La lettre de motivation a été copiée dans le presse-papiers.",
              });
            }}>
              Copier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetail;
