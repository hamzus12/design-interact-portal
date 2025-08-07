-- Create sample applications with existing candidates
INSERT INTO applications (job_id, candidate_id, status, created_at, cover_letter, resume_url) VALUES
-- First candidate applies to UX/UI Designer position
((SELECT id FROM jobs WHERE title = 'UX/UI Designer' LIMIT 1), 
 'c3c2f444-fdc6-4bc9-87f6-c13bed66340c',
 'pending', 
 now() - interval '2 days',
 'Je suis très intéressée par ce poste de UX/UI Designer. Mon expérience en design d''interface utilisateur correspond parfaitement aux exigences du poste.',
 'https://drive.google.com/file/d/candidate1-cv'),

-- Second candidate applies to Full Stack Developer position
((SELECT id FROM jobs WHERE title = 'Développeur Full Stack React/Node.js' LIMIT 1),
 '2f19acff-d74f-41c2-84a3-c6490743a3b2',
 'pending',
 now() - interval '1 day',
 'Fort de mon expérience en développement, je maîtrise React et Node.js. Je serais ravi de contribuer à vos projets innovants.',
 'https://drive.google.com/file/d/candidate2-cv'),

-- Third candidate applies to Marketing position
((SELECT id FROM jobs WHERE title = 'Chef de Projet Digital' LIMIT 1),
 'a8c4ad1c-5bac-4565-88a9-8e2e5281d14f',
 'accepted',
 now() - interval '5 days',
 'Mon expertise en marketing digital et ma capacité à gérer des projets font de moi la candidate idéale pour ce poste.',
 'https://drive.google.com/file/d/candidate3-cv'),

-- Fourth candidate applies to Data Scientist position
((SELECT id FROM jobs WHERE title = 'Data Scientist' LIMIT 1),
 '7a19a734-2fd6-4d94-a06e-6519d7c5af38',
 'pending',
 now() - interval '3 days',
 'Avec mon expérience en analyse de données, je souhaite vivement rejoindre votre équipe en tant que Data Scientist.',
 'https://drive.google.com/file/d/candidate4-cv'),

-- First candidate also applies to Data Scientist position
((SELECT id FROM jobs WHERE title = 'Data Scientist' LIMIT 1),
 'c3c2f444-fdc6-4bc9-87f6-c13bed66340c',
 'rejected',
 now() - interval '4 days',
 'Bien que spécialisée en design, je souhaite explorer le domaine de la science des données.',
 'https://drive.google.com/file/d/candidate1-cv'),

-- Second candidate applies to Marketing position
((SELECT id FROM jobs WHERE title = 'Chef de Projet Digital' LIMIT 1),
 '2f19acff-d74f-41c2-84a3-c6490743a3b2',
 'pending',
 now() - interval '6 hours',
 'Développeur souhaitant évoluer vers le marketing digital pour combiner technique et créativité.',
 'https://drive.google.com/file/d/candidate2-cv'),

-- Third candidate applies to UX/UI Designer position
((SELECT id FROM jobs WHERE title = 'UX/UI Designer' LIMIT 1),
 'a8c4ad1c-5bac-4565-88a9-8e2e5281d14f',
 'pending',
 now() - interval '12 hours',
 'Passionnée par l''expérience utilisateur, je souhaite contribuer à vos projets de design.',
 'https://drive.google.com/file/d/candidate3-cv'),

-- Fourth candidate applies to Full Stack Developer position
((SELECT id FROM jobs WHERE title = 'Développeur Full Stack React/Node.js' LIMIT 1),
 '7a19a734-2fd6-4d94-a06e-6519d7c5af38',
 'pending',
 now() - interval '8 hours',
 'Développeuse avec une forte motivation pour rejoindre une équipe Full Stack dynamique.',
 'https://drive.google.com/file/d/candidate4-cv');