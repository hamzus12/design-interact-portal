-- Corriger les politiques RLS problématiques
-- D'abord, nettoyer et recréer les politiques pour les utilisateurs

DROP POLICY IF EXISTS "Users can view their own profile" ON users;

CREATE POLICY "Users can view their own profile" 
ON users 
FOR SELECT 
USING (auth.uid() = user_id);

-- Assurer que les jobs sont visibles pour tous les utilisateurs authentifiés
-- (la politique existe déjà mais on la recrée pour être sûr)
DROP POLICY IF EXISTS "Anyone can view active jobs" ON jobs;

CREATE POLICY "Anyone can view active jobs" 
ON jobs 
FOR SELECT 
USING (is_active = true);

-- Politique pour permettre aux recruteurs de voir tous les jobs (les leurs aussi quand inactifs)
CREATE POLICY "Recruiters can view all their jobs" 
ON jobs 
FOR SELECT 
USING (recruiter_id IN (
  SELECT id FROM users WHERE user_id = auth.uid()
));