import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Briefcase, 
  Play, 
  Clock, 
  Target,
  ChevronRight,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import InterviewSimulation from '@/components/Chat/InterviewSimulation';
import { toast } from '@/components/ui/use-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  category: string;
  location: string;
}

const InterviewPractice: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // Get active jobs for interview practice
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, description, category, location')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      setJobs(data || []);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les offres d\'emploi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startGeneralInterview = () => {
    setSelectedJob(null);
    setShowSimulation(true);
  };

  const startJobSpecificInterview = (job: Job) => {
    setSelectedJob(job);
    setShowSimulation(true);
  };

  const handleInterviewComplete = (messages: any[]) => {
    setShowSimulation(false);
    setSelectedJob(null);
    
    toast({
      title: 'Entretien terminé !',
      description: `Vous avez échangé ${messages.length} messages. Bon travail !`,
    });
  };

  if (showSimulation) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowSimulation(false)}
              className="mb-4"
            >
              ← Retour à la sélection
            </Button>
            <h1 className="text-2xl font-bold">
              {selectedJob ? `Entretien - ${selectedJob.title}` : 'Entretien Général'}
            </h1>
            {selectedJob && (
              <p className="text-muted-foreground">{selectedJob.company} • {selectedJob.location}</p>
            )}
          </div>
          
          <InterviewSimulation
            jobId={selectedJob?.id}
            jobTitle={selectedJob?.title || 'Entretien général'}
            company={selectedJob?.company || 'Simulation'}
            onComplete={handleInterviewComplete}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            Simulation d'Entretiens
          </h1>
          <p className="text-muted-foreground text-lg">
            Pratiquez vos entretiens d'embauche avec notre IA spécialisée en recrutement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Simulations</p>
                  <p className="text-2xl font-bold">Illimitées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Postes Disponibles</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Durée Moyenne</p>
                  <p className="text-2xl font-bold">15-30 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start - General Interview */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-primary" />
              Entretien Général
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">
                  Commencez par un entretien généraliste pour pratiquer vos soft skills et votre présentation
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Questions générales</Badge>
                  <Badge variant="secondary">Présentation personnelle</Badge>
                  <Badge variant="secondary">Motivations</Badge>
                </div>
              </div>
              <Button onClick={startGeneralInterview} size="lg" className="ml-4">
                <Play className="w-4 h-4 mr-2" />
                Commencer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job-Specific Interviews */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Entretiens par Poste</h2>
          <p className="text-muted-foreground">
            Sélectionnez un poste spécifique pour une simulation d'entretien personnalisée
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune offre disponible</h3>
              <p className="text-muted-foreground">
                Il n'y a actuellement aucune offre d'emploi disponible pour la simulation
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{job.company}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">{job.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{job.location}</span>
                    <Button 
                      size="sm" 
                      onClick={() => startJobSpecificInterview(job)}
                      className="group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Pratiquer
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InterviewPractice;