-- Créer un compte admin de démonstration
-- Email: admin@demo.com
-- Password: AdminDemo2024!

-- D'abord, insérer l'utilisateur admin dans la table users si un utilisateur avec cet email existe dans auth
INSERT INTO public.users (user_id, email, first_name, last_name, role)
SELECT 
  id,
  email,
  'Admin',
  'Demo',
  'admin'
FROM auth.users
WHERE email = 'admin@demo.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin',
    first_name = 'Admin',
    last_name = 'Demo';

-- Ensuite, attribuer le rôle admin dans user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  'admin'::app_role
FROM auth.users
WHERE email = 'admin@demo.com'
ON CONFLICT (user_id, role) DO NOTHING;