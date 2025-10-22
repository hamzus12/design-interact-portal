-- Ajouter une policy pour permettre aux admins de voir tous les utilisateurs
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Ajouter une policy pour permettre aux admins de mettre à jour tous les utilisateurs
CREATE POLICY "Admins can update all users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Ajouter une policy pour permettre aux admins de supprimer des utilisateurs
CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);