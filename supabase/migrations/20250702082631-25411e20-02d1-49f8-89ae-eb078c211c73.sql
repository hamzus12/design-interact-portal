
-- D'abord, ajouter une contrainte unique sur l'email si elle n'existe pas
ALTER TABLE public.users ADD CONSTRAINT unique_email UNIQUE (email);

-- Créer un utilisateur démo avec accès admin
INSERT INTO public.users (
  user_id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@demo.com',
  'Admin',
  'Demo',
  'admin',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  first_name = 'Admin',
  last_name = 'Demo',
  updated_at = now();

-- Créer quelques données de test pour enrichir les statistiques
INSERT INTO public.jobs (
  title,
  company,
  description,
  location,
  category,
  job_type,
  salary_range,
  recruiter_id,
  is_active,
  created_at
) VALUES 
  ('Développeur Frontend', 'TechCorp', 'Poste de développeur React/Vue.js', 'Paris', 'Technologie', 'CDI', '45k-55k€', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true, now() - interval '5 days'),
  ('Designer UX/UI', 'DesignStudio', 'Conception d''interfaces utilisateur', 'Lyon', 'Design', 'CDI', '40k-50k€', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true, now() - interval '3 days'),
  ('Chef de Projet', 'ManageCorp', 'Gestion de projets agiles', 'Marseille', 'Management', 'CDI', '50k-60k€', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), false, now() - interval '1 day');

-- Créer quelques candidats de test
INSERT INTO public.users (
  user_id,
  email,
  first_name,
  last_name,
  role,
  created_at
) VALUES 
  (gen_random_uuid(), 'candidate1@demo.com', 'Jean', 'Dupont', 'candidate', now() - interval '10 days'),
  (gen_random_uuid(), 'candidate2@demo.com', 'Marie', 'Martin', 'candidate', now() - interval '8 days'),
  (gen_random_uuid(), 'candidate3@demo.com', 'Pierre', 'Bernard', 'candidate', now() - interval '2 days')
ON CONFLICT (email) DO NOTHING;

-- Créer quelques candidatures de test
INSERT INTO public.applications (
  job_id,
  candidate_id,
  status,
  cover_letter,
  created_at
) VALUES 
  ((SELECT id FROM jobs WHERE title = 'Développeur Frontend' LIMIT 1), (SELECT id FROM users WHERE email = 'candidate1@demo.com'), 'pending', 'Lettre de motivation pour le poste de développeur', now() - interval '3 days'),
  ((SELECT id FROM jobs WHERE title = 'Designer UX/UI' LIMIT 1), (SELECT id FROM users WHERE email = 'candidate2@demo.com'), 'accepted', 'Candidature pour le poste de designer', now() - interval '2 days'),
  ((SELECT id FROM jobs WHERE title = 'Chef de Projet' LIMIT 1), (SELECT id FROM users WHERE email = 'candidate3@demo.com'), 'rejected', 'Candidature pour le poste de chef de projet', now() - interval '1 day');
