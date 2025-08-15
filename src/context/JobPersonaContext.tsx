
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

// Define the shape of job analysis result
export interface JobAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  detailedAnalysis?: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
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
  analyzeJobMatch: (jobId: string) => Promise<JobAnalysis>;
  generateApplication: (jobId: string, applicationType?: string) => Promise<string>;
  simulateConversation: (jobId: string, question: string, history: any[]) => Promise<string>;
  submitApplication: (jobId: string, application: string) => Promise<boolean>;
  getStoredAnalysis: (jobId: string) => Promise<JobAnalysis | null>;
  getGeneratedApplications: (jobId?: string) => Promise<any[]>;
}

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

  // Get stored analysis from database
  const getStoredAnalysis = useCallback(async (jobId: string): Promise<JobAnalysis | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('job_match_analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single();
      
      if (error || !data) return null;
      
      return {
        score: data.match_score,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        recommendation: data.recommendation || '',
        detailedAnalysis: data.detailed_analysis || {}
      };
    } catch (error) {
      console.error('Error fetching stored analysis:', error);
      return null;
    }
  }, [user]);

  // Analyze job match - Enhanced with database storage
  const analyzeJobMatch = useCallback(async (jobId: string): Promise<JobAnalysis> => {
    if (!persona || !user) {
      throw new Error("JobPersona et authentification requis pour l'analyse");
    }

    console.log(`Analyzing job match for job ID: ${jobId}`);
    
    try {
      // Check if we have a stored analysis first
      const storedAnalysis = await getStoredAnalysis(jobId);
      if (storedAnalysis) {
        return storedAnalysis;
      }

      // Get job details from database
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        throw new Error("Impossible de récupérer les détails du poste");
      }

      // Call the enhanced job match analysis Edge Function
      const { data: analysisData, error: functionError } = await supabase.functions.invoke('job-match-analysis', {
        body: {
          jobData: job,
          personaData: persona
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Erreur lors de l'analyse");
      }

      if (!analysisData) {
        throw new Error("Aucune analyse générée");
      }

      const analysis: JobAnalysis = {
        score: analysisData.score,
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.weaknesses || [],
        recommendation: analysisData.recommendation || '',
        detailedAnalysis: analysisData.detailedAnalysis || {}
      };

      // Store the analysis in the database
      await supabase
        .from('job_match_analyses')
        .upsert({
          user_id: user.id,
          job_id: jobId,
          match_score: analysis.score,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendation: analysis.recommendation,
          detailed_analysis: analysis.detailedAnalysis
        });

      return analysis;
    } catch (error) {
      console.error("Error in job analysis:", error);
      throw error;
    }
  }, [persona, user, getStoredAnalysis]);

  // Generate application - Enhanced with database storage
  const generateApplication = useCallback(async (jobId: string, applicationType: string = "cover_letter"): Promise<string> => {
    if (!persona || !user) {
      throw new Error("JobPersona et authentification requis pour générer une candidature");
    }

    console.log(`Generating ${applicationType} for job ID: ${jobId}`);
    
    try {
      // Check if we already have a generated application
      const { data: existingApp } = await supabase
        .from('generated_applications')
        .select('content')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .eq('application_type', applicationType)
        .single();

      if (existingApp) {
        return existingApp.content;
      }

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

      // Store the generated application
      await supabase
        .from('generated_applications')
        .insert({
          user_id: user.id,
          job_id: jobId,
          application_type: applicationType,
          content: data.content
        });

      return data.content;
    } catch (error) {
      console.error("Error generating application:", error);
      throw error;
    }
  }, [persona, user]);

  // Get generated applications
  const getGeneratedApplications = useCallback(async (jobId?: string) => {
    if (!user) return [];
    
    try {
      let query = supabase
        .from('generated_applications')
        .select(`
          *,
          jobs:job_id (
            title,
            company
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching applications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }, [user]);

  // Simulate conversation - Enhanced with database storage
  const simulateConversation = useCallback(async (jobId: string, question: string, history: any[]): Promise<string> => {
    if (!user) {
      throw new Error("Authentification requise pour la simulation");
    }

    console.log(`Simulating conversation for job ID: ${jobId}, Question: ${question}`);
    
    try {
      // Get job details for context
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      // Call the simulate conversation Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('simulate-conversation', {
        body: {
          jobData: job,
          question: question,
          conversationHistory: history,
          personaData: persona
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Erreur lors de la simulation");
      }

      const response = data?.response || "Je suis désolé, je rencontre des difficultés techniques. Pourriez-vous reformuler votre question?";

      // Store the conversation in history
      await supabase
        .from('conversation_history')
        .insert({
          user_id: user.id,
          job_id: jobId,
          question: question,
          response: response
        });

      return response;
    } catch (error) {
      console.error("Error in conversation simulation:", error);
      return "Je suis désolé, je rencontre des difficultés techniques. Pourriez-vous reformuler votre question?";
    }
  }, [user, persona]);

  // Submit application - Enhanced implementation
  const submitApplication = useCallback(async (jobId: string, application: string): Promise<boolean> => {
    if (!user) {
      throw new Error("Authentification requise pour soumettre une candidature");
    }

    console.log(`Submitting application for job ID: ${jobId}`);
    
    try {
      // Mark the application as submitted in our database
      await supabase
        .from('generated_applications')
        .update({ is_submitted: true })
        .eq('user_id', user.id)
        .eq('job_id', jobId);

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
      
      toast({
        title: "Candidature soumise",
        description: "Votre candidature a été soumise avec succès!",
      });
      
      return true;
    } catch (error) {
      console.error("Error submitting application:", error);
      throw error;
    }
  }, [user, persona, updatePersona]);

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
      submitApplication,
      getStoredAnalysis,
      getGeneratedApplications
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
