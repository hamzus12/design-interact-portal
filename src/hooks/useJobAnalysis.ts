
import { useState, useCallback } from 'react';
import { useJobPersona } from '@/context/JobPersonaContext';
import { toast } from '@/components/ui/use-toast';

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  matchScore: number;
  applied: boolean;
  analysis?: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  };
}

export function useJobAnalysis() {
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [analyzingJob, setAnalyzingJob] = useState<string | null>(null);
  const { analyzeJobMatch, getStoredAnalysis } = useJobPersona();

  const analyzeJobWithLoading = useCallback(async (jobId: string) => {
    setAnalyzingJob(jobId);
    
    try {
      const analysis = await analyzeJobMatch(jobId);
      
      toast({
        title: "Analyse terminée",
        description: `Score de correspondance : ${analysis.score}%`,
      });
      
      return analysis;
    } catch (error) {
      console.error("Error analyzing job:", error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser la correspondance avec ce poste",
        variant: "destructive"
      });
      throw error;
    } finally {
      setAnalyzingJob(null);
    }
  }, [analyzeJobMatch]);

  const getJobAnalysis = useCallback(async (jobId: string) => {
    try {
      return await getStoredAnalysis(jobId);
    } catch (error) {
      console.error("Error getting stored analysis:", error);
      return null;
    }
  }, [getStoredAnalysis]);

  const calculateJobMatches = useCallback(async (jobs: any[], persona: any): Promise<JobMatch[]> => {
    if (!jobs.length || !persona) return [];
    
    setLoadingMatches(true);
    
    try {
      const matches: JobMatch[] = [];
      
      // Process jobs in smaller batches to avoid overwhelming the system
      for (const job of jobs.slice(0, 20)) {
        try {
          // Check if we have a stored analysis first
          const storedAnalysis = await getStoredAnalysis(job.id);
          
          if (storedAnalysis) {
            matches.push({
              id: job.id.toString(),
              title: job.title,
              company: job.company,
              matchScore: storedAnalysis.score,
              applied: false,
              analysis: storedAnalysis
            });
          } else {
            // Calculate a basic score based on skills match for now
            const jobText = `${job.title} ${job.description} ${job.category}`.toLowerCase();
            const matchingSkills = persona.skills?.filter((skill: string) => 
              jobText.includes(skill.toLowerCase())
            ) || [];
            
            const baseScore = Math.min(matchingSkills.length * 10 + 50, 95);
            const score = Math.max(baseScore + Math.floor(Math.random() * 10) - 5, 30);
            
            matches.push({
              id: job.id.toString(),
              title: job.title,
              company: job.company,
              matchScore: score,
              applied: false
            });
          }
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          // Add with default score on error
          matches.push({
            id: job.id.toString(),
            title: job.title,
            company: job.company,
            matchScore: 50,
            applied: false
          });
        }
      }
      
      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);
      
      return matches;
    } catch (error) {
      console.error("Error calculating job matches:", error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer les correspondances d'emploi",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingMatches(false);
    }
  }, [getStoredAnalysis]);

  return {
    loadingMatches,
    analyzingJob,
    analyzeJobWithLoading,
    getJobAnalysis,
    calculateJobMatches
  };
}
