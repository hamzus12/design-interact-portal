
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useUserMetadata } from '@/hooks/useUserMetadata';

// Define the shape of a JobPersona
export interface JobPersona {
  skills: string[];
  experience: string[];
  preferences: {
    jobTypes: string[];
    locations: string[];
    salary: {
      min: number;
      max: number;
    };
    remote: boolean;
  };
  learningProfile?: {
    feedback: Array<{
      message: string;
      sentimentScore: number;
      timestamp?: string;
    }>;
    successfulApplications: string[];
    rejectedApplications: string[];
  };
}

// Define the shape of the JobPersonaContext
interface JobPersonaContextType {
  persona: JobPersona | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  hasPersona: boolean;
  createPersona: (data: JobPersona) => Promise<boolean>;
  updatePersona: (data: Partial<JobPersona>) => Promise<boolean>;
  loadPersona: () => Promise<JobPersona | null>;
  analyzeJobMatch?: (jobId: string) => Promise<any>;
  generateApplication?: (jobId: string, applicationType?: string) => Promise<string>;
  simulateConversation?: (jobId: string, question: string, history: any[]) => Promise<string>;
  submitApplication?: (jobId: string, application: string) => Promise<boolean>;
}

// Default JobPersona
const defaultPersona: JobPersona = {
  skills: [],
  experience: [],
  preferences: {
    jobTypes: [],
    locations: [],
    salary: {
      min: 0,
      max: 0
    },
    remote: false
  },
  learningProfile: {
    feedback: [],
    successfulApplications: [],
    rejectedApplications: []
  }
};

// Create the context
const JobPersonaContext = createContext<JobPersonaContextType | undefined>(undefined);

export const JobPersonaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<JobPersona | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { updateMetadata, getMetadata, hasJobPersona } = useUserMetadata();
  
  // Load the user's JobPersona from Supabase Auth metadata
  const loadPersona = useCallback(async (): Promise<JobPersona | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setPersona(null);
        return null;
      }
      
      const storedPersona = getMetadata('job_persona', null);
      
      if (storedPersona) {
        // Ensure learningProfile exists
        if (!storedPersona.learningProfile) {
          storedPersona.learningProfile = {
            feedback: [],
            successfulApplications: [],
            rejectedApplications: []
          };
        }
        
        setPersona(storedPersona);
        return storedPersona;
      } else {
        setPersona(null);
        return null;
      }
    } catch (err: any) {
      console.error('Error loading JobPersona:', err);
      setError(err.message || 'Failed to load JobPersona');
      setPersona(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, getMetadata]);
  
  // Create a new JobPersona
  const createPersona = useCallback(async (data: JobPersona): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "Authentification requise",
          description: "Vous devez être connecté pour créer un JobPersona",
          variant: "destructive"
        });
        return false;
      }
      
      setIsCreating(true);
      setError(null);
      
      // Ensure the persona has a learningProfile
      if (!data.learningProfile) {
        data.learningProfile = {
          feedback: [],
          successfulApplications: [],
          rejectedApplications: []
        };
      }
      
      // Save the JobPersona to user metadata
      const { success } = await updateMetadata({
        job_persona: data,
        has_job_persona: true
      }, {
        showSuccessToast: true,
        successMessage: "JobPersona créé avec succès!"
      });
      
      if (!success) throw new Error("Échec de la sauvegarde du JobPersona");
      
      setPersona(data);
      return true;
    } catch (err: any) {
      console.error('Error creating JobPersona:', err);
      setError(err.message || 'Failed to create JobPersona');
      
      toast({
        title: "Erreur",
        description: err.message || "Échec de la création du JobPersona",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [user, updateMetadata]);
  
  // Update an existing JobPersona
  const updatePersona = useCallback(async (data: Partial<JobPersona>): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "Authentification requise",
          description: "Vous devez être connecté pour mettre à jour votre JobPersona",
          variant: "destructive"
        });
        return false;
      }
      
      if (!persona) {
        toast({
          title: "JobPersona introuvable",
          description: "Vous devez d'abord créer un JobPersona",
          variant: "destructive"
        });
        return false;
      }
      
      setIsUpdating(true);
      setError(null);
      
      // Merge the current persona with the updated data
      const updatedPersona = {
        ...persona,
        ...data,
        preferences: {
          ...persona.preferences,
          ...(data.preferences || {})
        },
        learningProfile: {
          ...persona.learningProfile,
          ...(data.learningProfile || {})
        }
      };
      
      // Save the updated JobPersona to user metadata
      const { success } = await updateMetadata({
        job_persona: updatedPersona
      }, {
        showSuccessToast: true,
        successMessage: "JobPersona mis à jour avec succès!"
      });
      
      if (!success) throw new Error("Échec de la mise à jour du JobPersona");
      
      setPersona(updatedPersona);
      return true;
    } catch (err: any) {
      console.error('Error updating JobPersona:', err);
      setError(err.message || 'Failed to update JobPersona');
      
      toast({
        title: "Erreur",
        description: err.message || "Échec de la mise à jour du JobPersona",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user, persona, updateMetadata]);

  // Analyze job match - Enhanced realistic implementation
  const analyzeJobMatch = useCallback(async (jobId: string) => {
    if (!persona) {
      throw new Error("JobPersona requis pour l'analyse");
    }

    console.log(`Analyzing job match for job ID: ${jobId}`);
    
    try {
      // Get job details from database
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        throw new Error("Impossible de récupérer les détails du poste");
      }

      // Perform realistic analysis
      let score = 50; // Base score
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      // Analyze skills match
      const jobText = `${job.title} ${job.description} ${job.category}`.toLowerCase();
      const matchingSkills = persona.skills.filter(skill => 
        jobText.includes(skill.toLowerCase())
      );
      
      if (matchingSkills.length > 0) {
        score += Math.min(matchingSkills.length * 8, 25);
        strengths.push(`Vos compétences en ${matchingSkills.slice(0, 3).join(', ')} correspondent parfaitement`);
      } else {
        weaknesses.push("Aucune compétence directement mentionnée dans l'offre");
      }

      // Analyze job type preference
      const jobTypes = [job.job_type, job.type].filter(Boolean);
      const matchingJobTypes = persona.preferences.jobTypes.filter(prefType =>
        jobTypes.some(jobType => jobType?.toLowerCase().includes(prefType.toLowerCase()))
      );
      
      if (matchingJobTypes.length > 0) {
        score += 15;
        strengths.push(`Le type de poste correspond à vos préférences (${matchingJobTypes.join(', ')})`);
      } else {
        weaknesses.push("Le type de poste ne correspond pas exactement à vos préférences");
      }

      // Analyze location preference
      const matchingLocations = persona.preferences.locations.filter(prefLoc =>
        job.location?.toLowerCase().includes(prefLoc.toLowerCase())
      );
      
      if (matchingLocations.length > 0) {
        score += 10;
        strengths.push(`La localisation ${job.location} correspond à vos préférences`);
      } else if (persona.preferences.remote && job.description?.toLowerCase().includes('remote')) {
        score += 15;
        strengths.push("Possibilité de télétravail disponible");
      } else {
        weaknesses.push("La localisation ne correspond pas parfaitement à vos préférences");
      }

      // Analyze experience level
      const experienceLevel = persona.experience.length;
      if (experienceLevel >= 3) {
        score += 10;
        strengths.push("Votre niveau d'expérience est adapté à ce poste");
      } else {
        weaknesses.push("Vous pourriez avoir besoin d'acquérir plus d'expérience");
      }

      // Cap the score
      score = Math.min(score, 95);

      let recommendation = "";
      if (score >= 80) {
        recommendation = "Excellente correspondance! Nous recommandons fortement de postuler.";
      } else if (score >= 65) {
        recommendation = "Bonne correspondance. Ce poste pourrait être intéressant pour vous.";
      } else if (score >= 50) {
        recommendation = "Correspondance correcte. Étudiez les exigences avant de postuler.";
      } else {
        recommendation = "Correspondance limitée. Considérez d'améliorer vos compétences.";
      }

      return {
        score,
        recommendation,
        strengths,
        weaknesses
      };
    } catch (error) {
      console.error("Error in job analysis:", error);
      throw error;
    }
  }, [persona]);

  // Generate application - Enhanced with real job data
  const generateApplication = useCallback(async (jobId: string, applicationType: string = "cover_letter") => {
    if (!persona) {
      throw new Error("JobPersona requis pour générer une candidature");
    }

    console.log(`Generating ${applicationType} for job ID: ${jobId}`);
    
    try {
      // Get job details
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        throw new Error("Impossible de récupérer les détails du poste");
      }

      // Call the Supabase Edge Function for generation
      const { data, error: functionError } = await supabase.functions.invoke('generate-application', {
        body: {
          jobData: job,
          personaData: persona,
          applicationType
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Erreur lors de la génération");
      }

      if (!data?.content) {
        throw new Error("Aucun contenu généré");
      }

      return data.content;
    } catch (error) {
      console.error("Error generating application:", error);
      throw error;
    }
  }, [persona]);

  // Simulate conversation - Enhanced implementation
  const simulateConversation = useCallback(async (jobId: string, question: string, history: any[]) => {
    console.log(`Simulating conversation for job ID: ${jobId}, Question: ${question}`);
    
    try {
      // Get job details for context
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      // Enhanced response generation based on question context
      const questionLower = question.toLowerCase();
      
      if (questionLower.includes('salaire') || questionLower.includes('rémunération')) {
        return `Pour le poste de ${job?.title}, la rémunération est compétitive et basée sur l'expérience. Nous proposons généralement des packages dans la fourchette mentionnée dans l'offre, ainsi que des avantages comme l'assurance santé et les plans de retraite.`;
      } else if (questionLower.includes('expérience') || questionLower.includes('compétence')) {
        return `Nous recherchons des candidats avec au moins 2-3 ans d'expérience pertinente dans le domaine. Cependant, nous valorisons aussi le potentiel et l'adéquation culturelle, alors n'hésitez pas à postuler même si vous êtes légèrement en dessous de ce seuil.`;
      } else if (questionLower.includes('télétravail') || questionLower.includes('remote')) {
        return `Nous offrons une flexibilité de télétravail selon le poste. Pour ce poste de ${job?.title}, nous proposons un mode hybride avec 2-3 jours de télétravail par semaine.`;
      } else if (questionLower.includes('formation') || questionLower.includes('développement')) {
        return `Nous investissons fortement dans le développement de nos employés. Nous proposons des formations continues, des certifications et des opportunités de mentorat pour aider nos équipes à grandir.`;
      } else if (questionLower.includes('équipe') || questionLower.includes('culture')) {
        return `Notre équipe est dynamique et collaborative. Nous favorisons un environnement inclusif où chacun peut s'épanouir. La culture d'entreprise met l'accent sur l'innovation et le bien-être des employés.`;
      } else {
        return `C'est une excellente question concernant le poste de ${job?.title}. Je serais ravi de vous fournir plus d'informations. N'hésitez pas à me poser des questions spécifiques sur le rôle, la culture d'entreprise ou les avantages.`;
      }
    } catch (error) {
      console.error("Error in conversation simulation:", error);
      return "Je suis désolé, je rencontre des difficultés techniques. Pourriez-vous reformuler votre question?";
    }
  }, []);

  // Submit application - Enhanced implementation
  const submitApplication = useCallback(async (jobId: string, application: string) => {
    console.log(`Submitting application for job ID: ${jobId}`);
    
    try {
      // Update learning profile with the application
      if (persona && persona.learningProfile) {
        const updatedLearningProfile = {
          ...persona.learningProfile,
          successfulApplications: [...persona.learningProfile.successfulApplications, jobId]
        };
        
        await updatePersona({
          learningProfile: updatedLearningProfile
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error submitting application:", error);
      throw error;
    }
  }, [persona, updatePersona]);

  // Initialize on mount and whenever auth status changes
  React.useEffect(() => {
    if (!authLoading) {
      loadPersona().catch(console.error);
    }
  }, [authLoading, loadPersona]);

  // Determine if the user has a JobPersona
  const hasPersona = Boolean(persona);

  return (
    <JobPersonaContext.Provider value={{
      persona,
      isLoading,
      isCreating,
      isUpdating,
      error,
      hasPersona,
      createPersona,
      updatePersona,
      loadPersona,
      analyzeJobMatch,
      generateApplication,
      simulateConversation,
      submitApplication
    }}>
      {children}
    </JobPersonaContext.Provider>
  );
};

// Hook to use the JobPersona context
export const useJobPersona = () => {
  const context = useContext(JobPersonaContext);
  if (context === undefined) {
    throw new Error('useJobPersona must be used within a JobPersonaProvider');
  }
  return context;
};
