
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
}

// Define the shape of the JobPersonaContext
interface JobPersonaContextType {
  persona: JobPersona | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  createPersona: (data: JobPersona) => Promise<boolean>;
  updatePersona: (data: Partial<JobPersona>) => Promise<boolean>;
  loadPersona: () => Promise<JobPersona | null>;
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
  const { updateMetadata, getMetadata } = useUserMetadata();
  
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

  // Initialize on mount and whenever auth status changes
  React.useEffect(() => {
    if (!authLoading) {
      loadPersona().catch(console.error);
    }
  }, [authLoading, loadPersona]);

  return (
    <JobPersonaContext.Provider value={{
      persona,
      isLoading,
      isCreating,
      isUpdating,
      error,
      createPersona,
      updatePersona,
      loadPersona
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
