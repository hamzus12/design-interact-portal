
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
  generateApplication?: (jobId: string) => Promise<string>;
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
          title: "Authentication Required",
          description: "You must be logged in to create a JobPersona",
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
        successMessage: "JobPersona created successfully!"
      });
      
      if (!success) throw new Error("Failed to save JobPersona to user metadata");
      
      setPersona(data);
      return true;
    } catch (err: any) {
      console.error('Error creating JobPersona:', err);
      setError(err.message || 'Failed to create JobPersona');
      
      toast({
        title: "Error",
        description: err.message || "Failed to create JobPersona",
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
          title: "Authentication Required",
          description: "You must be logged in to update your JobPersona",
          variant: "destructive"
        });
        return false;
      }
      
      if (!persona) {
        toast({
          title: "JobPersona Not Found",
          description: "You need to create a JobPersona first",
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
        successMessage: "JobPersona updated successfully!"
      });
      
      if (!success) throw new Error("Failed to update JobPersona");
      
      setPersona(updatedPersona);
      return true;
    } catch (err: any) {
      console.error('Error updating JobPersona:', err);
      setError(err.message || 'Failed to update JobPersona');
      
      toast({
        title: "Error",
        description: err.message || "Failed to update JobPersona",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user, persona, updateMetadata]);

  // Analyze job match (mock implementation)
  const analyzeJobMatch = useCallback(async (jobId: string) => {
    // This would be replaced with a real API call in production
    console.log(`Analyzing job match for job ID: ${jobId}`);
    
    return {
      score: Math.floor(Math.random() * 30) + 70, // Random score between 70-99
      recommendation: "This job is a good match for your skills and experience.",
      strengths: [
        "Your React skills align well with this position",
        "You have the required years of experience",
        "Your location preferences match"
      ],
      weaknesses: [
        "Consider improving your TypeScript skills",
        "This role may require more leadership experience"
      ]
    };
  }, [persona]);

  // Generate application (mock implementation)
  const generateApplication = useCallback(async (jobId: string) => {
    // This would be replaced with a real API call in production
    console.log(`Generating application for job ID: ${jobId}`);
    
    return `Dear Hiring Manager,

I am writing to express my interest in the open position at your company. With my background in software development and experience with modern web technologies, I believe I would be a valuable addition to your team.

My technical skills include React, TypeScript, and Node.js, and I have a proven track record of delivering high-quality applications on time and within budget.

I look forward to the opportunity to discuss how my skills and experience align with your needs.

Sincerely,
[Your Name]`;
  }, [persona]);

  // Simulate conversation (mock implementation)
  const simulateConversation = useCallback(async (jobId: string, question: string, history: any[]) => {
    // This would be replaced with a real API call in production
    console.log(`Simulating conversation for job ID: ${jobId}, Question: ${question}`);
    console.log('Conversation history:', history);
    
    // Simple response generation based on question
    if (question.toLowerCase().includes('salary')) {
      return "The salary for this position is competitive and based on experience. We typically offer packages in the range mentioned in the job description, along with benefits like health insurance and retirement plans.";
    } else if (question.toLowerCase().includes('experience')) {
      return "We're looking for candidates with at least 3 years of relevant experience in the field. However, we also value potential and cultural fit, so don't hesitate to apply even if you're slightly below that threshold.";
    } else {
      return "That's a great question. I'd be happy to provide more information about this position. Please feel free to ask any specific details you'd like to know about the role, company culture, or benefits.";
    }
  }, []);

  // Submit application (mock implementation)
  const submitApplication = useCallback(async (jobId: string, application: string) => {
    // This would be replaced with a real API call in production
    console.log(`Submitting application for job ID: ${jobId}`);
    console.log('Application content:', application);
    
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
