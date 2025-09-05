-- Vérifier et corriger les politiques RLS pour permettre à tous les utilisateurs authentifiés de voir les jobs actifs
DROP POLICY IF EXISTS "Anyone can view active jobs" ON jobs;

-- Créer une nouvelle politique plus permissive pour voir les jobs actifs
CREATE POLICY "Anyone can view active jobs" 
ON jobs 
FOR SELECT 
USING (is_active = true);

-- Vérifier et corriger les politiques pour les applications
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Candidates can view own applications" ON applications;

-- Politique pour que les candidats voient leurs propres candidatures
CREATE POLICY "Candidates can view own applications" 
ON applications 
FOR SELECT 
USING (candidate_id IN (
  SELECT id FROM users WHERE user_id = auth.uid()
));

-- Politique pour que les recruteurs voient les candidatures pour leurs jobs
CREATE POLICY "Recruiters can view job applications" 
ON applications 
FOR SELECT 
USING (job_id IN (
  SELECT id FROM jobs WHERE recruiter_id IN (
    SELECT id FROM users WHERE user_id = auth.uid()
  )
));