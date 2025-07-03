
-- Corriger la contrainte de clé étrangère pour generated_applications
ALTER TABLE public.generated_applications 
DROP CONSTRAINT IF EXISTS generated_applications_user_id_fkey;

-- Ajouter la bonne contrainte de clé étrangère qui référence la table users
ALTER TABLE public.generated_applications 
ADD CONSTRAINT generated_applications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Nettoyer les données existantes - supprimer les enregistrements avec des user_id invalides
DELETE FROM public.generated_applications 
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Mettre à jour les politiques RLS pour être cohérentes
DROP POLICY IF EXISTS "Users can create their own applications" ON public.generated_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.generated_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.generated_applications;

-- Créer des politiques RLS cohérentes qui utilisent l'ID de la table users
CREATE POLICY "Users can create own generated applications" 
ON public.generated_applications 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own generated applications" 
ON public.generated_applications 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own generated applications" 
ON public.generated_applications 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid()));
