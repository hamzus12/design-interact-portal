
import { useState, useCallback } from 'react';
import { useJobPersona } from '@/context/JobPersonaContext';
import { toast } from '@/components/ui/use-toast';

export function useApplications() {
  const [generatingApplication, setGeneratingApplication] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const { generateApplication, submitApplication, getGeneratedApplications } = useJobPersona();

  const generateApplicationWithLoading = useCallback(async (jobId: string, applicationType: string = 'cover_letter') => {
    setGeneratingApplication(true);
    
    try {
      const content = await generateApplication(jobId, applicationType);
      
      toast({
        title: "Candidature générée",
        description: "Votre candidature a été générée avec succès",
      });
      
      return content;
    } catch (error) {
      console.error("Error generating application:", error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la candidature",
        variant: "destructive"
      });
      throw error;
    } finally {
      setGeneratingApplication(false);
    }
  }, [generateApplication]);

  const submitApplicationWithLoading = useCallback(async (jobId: string, applicationContent: string) => {
    setSubmittingApplication(true);
    
    try {
      const success = await submitApplication(jobId, applicationContent);
      
      if (success) {
        toast({
          title: "Candidature soumise",
          description: "Votre candidature a été soumise avec succès",
        });
        
        // Refresh applications list
        await loadApplications();
      }
      
      return success;
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Erreur de soumission",
        description: "Impossible de soumettre la candidature",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmittingApplication(false);
    }
  }, [submitApplication]);

  const loadApplications = useCallback(async (jobId?: string) => {
    setLoadingApplications(true);
    
    try {
      const apps = await getGeneratedApplications(jobId);
      setApplications(apps);
      return apps;
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les candidatures",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingApplications(false);
    }
  }, [getGeneratedApplications]);

  return {
    generatingApplication,
    submittingApplication,
    loadingApplications,
    applications,
    generateApplicationWithLoading,
    submitApplicationWithLoading,
    loadApplications
  };
}
