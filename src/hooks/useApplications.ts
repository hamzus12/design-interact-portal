
import { useState, useCallback } from 'react';
import { useJobPersona } from '@/context/JobPersonaContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useApplications() {
  const [generatingApplication, setGeneratingApplication] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const { generateApplication, submitApplication, getGeneratedApplications } = useJobPersona();
  const { user } = useAuth();

  const loadApplications = useCallback(async (jobId?: string) => {
    setLoadingApplications(true);
    
    try {
      if (!user?.id) {
        setApplications([]);
        return [];
      }

      // Get database user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error getting user data:', userError);
        return [];
      }

      // Query generated applications with job details
      let query = supabase
        .from('generated_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            company,
            company_logo
          )
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data: apps, error } = await query;

      if (error) {
        throw error;
      }

      setApplications(apps || []);
      return apps || [];
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
  }, [user]);

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
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('Starting application submission for job:', jobId);

      // Get database user ID first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('User lookup error:', userError);
        throw new Error('Impossible de trouver votre profil utilisateur');
      }

      console.log('Found user ID:', userData.id);

      // Check if application already exists for this job
      const { data: existingApp, error: checkError } = await supabase
        .from('generated_applications')
        .select('id, is_submitted')
        .eq('user_id', userData.id)
        .eq('job_id', jobId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing application:', checkError);
        throw checkError;
      }

      let appData;

      if (existingApp) {
        // Update existing application
        const { data: updatedApp, error: updateError } = await supabase
          .from('generated_applications')
          .update({
            content: applicationContent,
            is_submitted: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingApp.id)
          .select()
          .single();

        if (updateError) {
          console.error('Generated application update error:', updateError);
          throw updateError;
        }

        appData = updatedApp;
        console.log('Generated application updated:', appData);
      } else {
        // Create new application
        const { data: newApp, error: insertError } = await supabase
          .from('generated_applications')
          .insert({
            user_id: userData.id,
            job_id: jobId,
            content: applicationContent,
            application_type: 'cover_letter',
            is_submitted: true
          })
          .select()
          .single();

        if (insertError) {
          console.error('Generated application insert error:', insertError);
          throw insertError;
        }

        appData = newApp;
        console.log('Generated application created:', appData);
      }

      // Check if application already exists in applications table
      const { data: existingSubmission, error: submissionCheckError } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('candidate_id', userData.id)
        .maybeSingle();

      if (submissionCheckError) {
        console.error('Error checking existing submission:', submissionCheckError);
      }

      // Create or update entry in applications table for recruiter visibility
      if (!existingSubmission) {
        const { error: submissionError } = await supabase
          .from('applications')
          .insert({
            job_id: jobId,
            candidate_id: userData.id,
            cover_letter: applicationContent,
            status: 'pending'
          });

        if (submissionError) {
          console.error('Application submission error:', submissionError);
          // Don't throw here as the main application was saved
        }
      } else {
        const { error: updateSubmissionError } = await supabase
          .from('applications')
          .update({
            cover_letter: applicationContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubmission.id);

        if (updateSubmissionError) {
          console.error('Application update error:', updateSubmissionError);
        }
      }

      toast({
        title: "Candidature soumise",
        description: "Votre candidature a été soumise avec succès",
      });
      
      // Refresh applications list
      await loadApplications();
      
      return true;
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Erreur de soumission",
        description: error instanceof Error ? error.message : "Impossible de soumettre la candidature",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmittingApplication(false);
    }
  }, [user, loadApplications]);

  const getApplicationStatus = useCallback(async (jobId: string) => {
    if (!user?.id) return null;

    try {
      // Get database user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userData) {
        return null;
      }

      // Check application status
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('job_id', jobId)
        .eq('candidate_id', userData.id)
        .maybeSingle();

      if (error) {
        console.error('Error getting application status:', error);
        return null;
      }

      return data?.status || null;
    } catch (error) {
      console.error('Error getting application status:', error);
      return null;
    }
  }, [user]);

  return {
    generatingApplication,
    submittingApplication,
    loadingApplications,
    applications,
    generateApplicationWithLoading,
    submitApplicationWithLoading,
    loadApplications,
    getApplicationStatus
  };
}
