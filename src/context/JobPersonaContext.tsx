
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
      timestamp?: string;
    }>;
  };
  lastUpdated: string;
}

interface JobMatchAnalysis {
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

interface FeedbackData {
  message: string;
  sentimentScore?: number;
  suggestedSkills?: string[];
}

interface JobPersonaContextType {
  persona: JobPersonaProfile | null;
  isLoading: boolean;
  isCreating: boolean;
  hasPersona: boolean;
  createPersona: (initialData: Partial<JobPersonaProfile>) => Promise<boolean>;
  updatePersona: (updates: Partial<JobPersonaProfile>) => Promise<boolean>;
  generateApplication: (jobId: string, type?: string) => Promise<string | null>;
  simulateConversation: (jobId: string, question: string, history?: Array<{role: string, content: string}>) => Promise<string | null>;
  analyzeJobMatch: (jobId: string) => Promise<JobMatchAnalysis | null>;
  submitApplication: (jobId: string, coverLetter: string) => Promise<boolean>;
  processFeedback: (jobId: string, feedback: FeedbackData, result?: string) => Promise<boolean>;
  learningPoints: string[];
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
  submitApplication: async () => false,
  processFeedback: async () => false,
  learningPoints: [],
};

const JobPersonaContext = createContext<JobPersonaContextType>(defaultPersonaContext);

export function JobPersonaProvider({ children }: { children: ReactNode }) {
  const { user } = useUserRole();
  const { updateMetadata, getJobPersona, hasJobPersona } = useUserMetadata();
  const [persona, setPersona] = useState<JobPersonaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [learningPoints, setLearningPoints] = useState<string[]>([]);

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

  const analyzeJobMatch = async (jobId: string): Promise<JobMatchAnalysis | null> => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "You need to create a JobPersona first",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Fetch the job data first
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        console.error("Error fetching job:", jobError);
        throw new Error("Failed to fetch job details");
      }

      // Call the job-match-analysis edge function
      const { data, error } = await supabase.functions.invoke('job-match-analysis', {
        body: {
          jobData,
          personaData: persona
        }
      });

      if (error) {
        console.error("Error analyzing job match:", error);
        throw new Error(error.message || "Failed to analyze job match");
      }
      
      return data as JobMatchAnalysis;
      
    } catch (error: any) {
      console.error("Error analyzing job match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze job match. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const generateApplication = async (jobId: string, type = "cover_letter"): Promise<string | null> => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "You need to create a JobPersona first",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Fetch the job data
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        console.error("Error fetching job:", jobError);
        throw new Error("Failed to fetch job details");
      }

      // Call the generate-application edge function
      const { data, error } = await supabase.functions.invoke('generate-application', {
        body: {
          jobData,
          personaData: persona,
          applicationType: type
        }
      });

      if (error) {
        console.error("Error generating application:", error);
        throw new Error(error.message || "Failed to generate application content");
      }
      
      return data.content;
      
    } catch (error: any) {
      console.error("Error generating application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate application. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const simulateConversation = async (
    jobId: string, 
    question: string,
    history: Array<{role: string, content: string}> = []
  ): Promise<string | null> => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "You need to create a JobPersona first",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Fetch the job data
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        console.error("Error fetching job:", jobError);
        throw new Error("Failed to fetch job details");
      }

      // Call the simulate-conversation edge function
      const { data, error } = await supabase.functions.invoke('simulate-conversation', {
        body: {
          jobData,
          personaData: persona,
          question,
          conversationHistory: history
        }
      });

      if (error) {
        console.error("Error simulating conversation:", error);
        throw new Error(error.message || "Failed to simulate conversation");
      }
      
      return data.response;
      
    } catch (error: any) {
      console.error("Error simulating conversation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to simulate conversation. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const submitApplication = async (jobId: string, coverLetter: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to submit an application",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Submit the application to the database
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          candidate_id: user.id,
          cover_letter: coverLetter,
          status: 'pending',
          resume_url: user.resumeUrl || null  // Fix: change resume_url to resumeUrl
        }])
        .select();
      
      if (error) {
        console.error("Error submitting application:", error);
        throw new Error("Failed to submit application");
      }
      
      toast({
        title: "Success",
        description: "Your application has been submitted successfully!",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const processFeedback = async (jobId: string, feedback: FeedbackData, result = "pending"): Promise<boolean> => {
    if (!user || !persona) {
      toast({
        title: "Error",
        description: "You need to create a JobPersona first",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Fetch the job data
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        console.error("Error fetching job:", jobError);
        throw new Error("Failed to fetch job details");
      }

      // Call the update-learning-profile edge function
      const { data, error } = await supabase.functions.invoke('update-learning-profile', {
        body: {
          user_id: user.id,
          jobData,
          feedbackData: feedback,
          applicationResult: result
        }
      });

      if (error) {
        console.error("Error processing feedback:", error);
        throw new Error(error.message || "Failed to process feedback");
      }
      
      // Refresh the persona data
      const refreshedPersona = getJobPersona();
      if (refreshedPersona) {
        setPersona(refreshedPersona);
      }
      
      // Update learning points from the response
      if (data.learningPoints) {
        setLearningPoints(data.learningPoints);
      }
      
      toast({
        title: "Success",
        description: "Your JobPersona has learned from this feedback!",
      });
      
      return true;
      
    } catch (error: any) {
      console.error("Error processing feedback:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process feedback. Please try again.",
        variant: "destructive"
      });
      return false;
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
      analyzeJobMatch,
      submitApplication,
      processFeedback,
      learningPoints
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
