import { useState, useCallback } from 'react';
import { useJobPersona } from '@/context/JobPersonaContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useSmartCache } from '@/hooks/useSmartCache';
import { useDebugLogger } from '@/hooks/useDebugLogger';

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
  const { success, error } = useToastNotifications();
  const cache = useSmartCache<any>({ ttl: 10 * 60 * 1000 }); // 10 minutes cache
  const logger = useDebugLogger('JobAnalysis');

  const analyzeJobWithLoading = useCallback(async (jobId: string) => {
    setAnalyzingJob(jobId);
    
    try {
      logger.info(`Starting job analysis for job ${jobId}`);
      const analysis = await analyzeJobMatch(jobId);
      
      success({
        title: "Analyse terminée",
        description: `Score de correspondance : ${analysis.score}%`,
      });
      
      logger.info(`Job analysis completed for job ${jobId}`, { score: analysis.score });
      return analysis;
    } catch (error) {
      logger.error("Error analyzing job:", error);
      error({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser la correspondance avec ce poste",
      });
      throw error;
    } finally {
      setAnalyzingJob(null);
    }
  }, [analyzeJobMatch, success, error, logger]);

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
    
    const cacheKey = cache.getCacheKey('job_matches', { 
      jobCount: jobs.length, 
      personaId: persona.id || 'default' 
    });
    
    // Check cache first
    const cachedMatches = cache.get(cacheKey);
    if (cachedMatches) {
      logger.debug('Using cached job matches', { cacheKey });
      return cachedMatches;
    }
    
    setLoadingMatches(true);
    logger.info('Calculating job matches', { jobCount: jobs.length });
    
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
      
      // Cache the results
      cache.set(cacheKey, matches);
      logger.info('Job matches calculated and cached', { matchCount: matches.length });
      
      return matches;
    } catch (error) {
      logger.error("Error calculating job matches:", error);
      error({
        title: "Erreur",
        description: "Impossible de calculer les correspondances d'emploi",
      });
      return [];
    } finally {
      setLoadingMatches(false);
    }
  }, [getStoredAnalysis, cache, logger, success, error]);

  return {
    loadingMatches,
    analyzingJob,
    analyzeJobWithLoading,
    getJobAnalysis,
    calculateJobMatches
  };
}