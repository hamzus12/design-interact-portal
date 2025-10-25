-- Supprimer les anciennes policies qui causent la récursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Créer de nouvelles policies utilisant has_role pour éviter la récursion
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all users"
ON public.users
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));