
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserRole } from './UserContext';
import { useUserMetadata } from '@/hooks/useUserMetadata';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface JobPersonaProfile {
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
  learningProfile: {
    successfulApplications: string[];
    rejectedApplications: string[];
    feedback: Array<{
      jobId: string;
      message: string;
      sentimentScore: number;
    }>;
  };
  lastUpdated: string;
}

interface JobPersonaContextType {
  persona: JobPersonaProfile | null;
  isLoading: boolean;
  isCreating: boolean;
  hasPersona: boolean;
  createPersona: (initialData: Partial<JobPersonaProfile>) => Promise<boolean>;
  updatePersona: (updates: Partial<JobPersonaProfile>) => Promise<boolean>;
  generateApplication: (jobId: string) => Promise<string | null>;
  simulateConversation: (jobId: string, question: string) => Promise<string | null>;
  analyzeJobMatch: (jobId: string) => Promise<{ 
    score: number; 
    strengths: string[]; 
    weaknesses: string[];
    recommendation: string;
  } | null>;
}

const defaultPersonaContext: JobPersonaContextType = {
  persona: null,
  isLoading: true,
  isCreating: false,
  hasPersona: false,
  createPersona: async () => false,
  updatePersona: async () => false,
  generateApplication: async () => null,
  simulateConversation: async () => null,
  analyzeJobMatch: async () => null,
};

const JobPersonaContext = createContext<JobPersonaContextType>(defaultPersonaContext);

export function JobPersonaProvider({ children }: { children: ReactNode }) {
  const { user } = useUserRole();
  const { updateMetadata, getJobPersona, hasJobPersona } = useUserMetadata();
  const [persona, setPersona] = useState<JobPersonaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load persona on mount if it exists
  useEffect(() => {
    if (user) {
      const existingPersona = getJobPersona();
      if (existingPersona) {
        setPersona(existingPersona);
      }
      setIsLoading(false);
    }
  }, [user, getJobPersona]);

  const createPersona = async (initialData: Partial<JobPersonaProfile>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be signed in to create a JobPersona",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsCreating(true);
      
      const newPersona: JobPersonaProfile = {
        skills: initialData.skills || [],
        experience: initialData.experience || [],
        preferences: initialData.preferences || {
          jobTypes: [],
          locations: [],
          salary: { min: 0, max: 0 },
          remote: false
        },
        learningProfile: {
          successfulApplications: [],
          rejectedApplications: [],
          feedback: []
        },
        lastUpdated: new Date().toISOString()
      };

      const result = await updateMetadata({
        job_persona: newPersona,
        has_job_persona: true
      }, {
        successMessage: "JobPersona AI created successfully!"
      });

      if (result.success) {
        setPersona(newPersona);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error creating JobPersona:", error);
      toast({
        title: "Error",
        description: "Failed to create JobPersona. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const updatePersona = async (updates: Partial<JobPersonaProfile>): Promise<boolean> => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "No JobPersona found to update",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsCreating(true);
      
      const updatedPersona = {
        ...persona,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      const result = await updateMetadata({
        job_persona: updatedPersona
      }, {
        successMessage: "JobPersona updated successfully!"
      });

      if (result.success) {
        setPersona(updatedPersona);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error updating JobPersona:", error);
      toast({
        title: "Error",
        description: "Failed to update JobPersona. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const generateApplication = async (jobId: string): Promise<string | null> => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "You need to create a JobPersona first",
        variant: "destructive"
      });
      return null;
    }

    try {
      // In a real implementation, this would call an AI function through Supabase Edge Function
      // For now, we'll return a placeholder
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      
      // Simulate a response for now
      return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${data.title} position at ${data.company}. With my experience in ${persona.skills.slice(0, 3).join(', ')}, I believe I would be a valuable addition to your team.\n\n[This is a placeholder. In the full implementation, this would be an AI-generated cover letter tailored to the job and the candidate's profile.]\n\nSincerely,\n${user.firstName} ${user.lastName}`;
      
    } catch (error) {
      console.error("Error generating application:", error);
      toast({
        title: "Error",
        description: "Failed to generate application. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const simulateConversation = async (jobId: string, question: string): Promise<string | null> => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "You need to create a JobPersona first",
        variant: "destructive"
      });
      return null;
    }

    try {
      // In a real implementation, this would call an AI function
      // For now, we'll return a placeholder
      return "This is a simulated response from the JobPersona AI. In the full implementation, this would be an AI-generated response to the recruiter's question, based on the candidate's profile and the job requirements.";
      
    } catch (error) {
      console.error("Error simulating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to simulate conversation. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const analyzeJobMatch = async (jobId: string) => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "You need to create a JobPersona first",
        variant: "destructive"
      });
      return null;
    }

    try {
      // In a real implementation, this would call an AI function
      // For now, we'll return a placeholder
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) throw error;

      // Simulate analysis for now
      return {
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60 and 99
        strengths: ["Relevant skills match", "Experience in similar roles", "Location preference match"],
        weaknesses: ["Missing some technical skills", "Salary expectations may be high"],
        recommendation: "This job appears to be a good match for your profile. Consider applying with a custom cover letter highlighting your relevant experience."
      };
      
    } catch (error) {
      console.error("Error analyzing job match:", error);
      toast({
        title: "Error",
        description: "Failed to analyze job match. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  return (
    <JobPersonaContext.Provider value={{
      persona,
      isLoading,
      isCreating,
      hasPersona: hasJobPersona(),
      createPersona,
      updatePersona,
      generateApplication,
      simulateConversation,
      analyzeJobMatch
    }}>
      {children}
    </JobPersonaContext.Provider>
  );
}

export const useJobPersona = () => {
  const context = useContext(JobPersonaContext);
  if (context === undefined) {
    throw new Error("useJobPersona must be used within a JobPersonaProvider");
  }
  return context;
};
