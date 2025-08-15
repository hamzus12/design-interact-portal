-- Create sample applications linking candidates to jobs
-- First, get the candidate profiles and jobs data to create meaningful applications

-- Insert applications for the candidates we created earlier
INSERT INTO applications (job_id, candidate_id, status, created_at, cover_letter, resume_url) VALUES
-- Jennifer Adams applies to UX/UI Designer position
((SELECT id FROM jobs WHERE title = 'UX/UI Designer' LIMIT 1), 
 (SELECT id FROM users WHERE email = 'jennifer.adams@email.com' LIMIT 1),
 'pending', 
 now() - interval '2 days',
 'Je suis très intéressée par ce poste de UX/UI Designer. Mon expérience de 5 ans en design d''interface utilisateur et ma maîtrise de Figma correspondent parfaitement aux exigences du poste.',
 'https://drive.google.com/file/d/jennifer-adams-cv'),

-- Michael Johnson applies to Full Stack Developer position
((SELECT id FROM jobs WHERE title = 'Développeur Full Stack React/Node.js' LIMIT 1),
 (SELECT id FROM users WHERE email = 'michael.johnson@email.com' LIMIT 1),
 'pending',
 now() - interval '1 day',
 'Fort de mes 7 ans d''expérience en développement Full Stack, je maîtrise parfaitement React, Node.js et TypeScript. Je serais ravi de contribuer à vos projets innovants.',
 'https://drive.google.com/file/d/michael-johnson-cv'),

-- Emma Wilson applies to Marketing position
((SELECT id FROM jobs WHERE title = 'Chef de Projet Digital' LIMIT 1),
 (SELECT id FROM users WHERE email = 'emma.wilson@email.com' LIMIT 1),
 'accepted',
 now() - interval '5 days',
 'Mon expertise en marketing digital et ma capacité à gérer des équipes font de moi la candidate idéale pour ce poste de Chef de Projet Digital.',
 'https://drive.google.com/file/d/emma-wilson-cv'),

-- David Chen applies to Data Scientist position
((SELECT id FROM jobs WHERE title = 'Data Scientist' LIMIT 1),
 (SELECT id FROM users WHERE email = 'david.chen@email.com' LIMIT 1),
 'pending',
 now() - interval '3 days',
 'Avec 8 ans d''expérience en stratégie produit et ma passion pour l''analyse de données, je souhaite vivement rejoindre votre équipe en tant que Data Scientist.',
 'https://drive.google.com/file/d/david-chen-cv'),

-- Sarah Parker applies to UX/UI Designer position too
((SELECT id FROM jobs WHERE title = 'UX/UI Designer' LIMIT 1),
 (SELECT id FROM users WHERE email = 'sarah.parker@email.com' LIMIT 1),
 'rejected',
 now() - interval '4 days',
 'En tant que graphiste créative avec 6 ans d''expérience, je pense pouvoir apporter une nouvelle perspective au design UX/UI.',
 'https://drive.google.com/file/d/sarah-parker-cv'),

-- James Wilson applies to Data Scientist position
((SELECT id FROM jobs WHERE title = 'Data Scientist' LIMIT 1),
 (SELECT id FROM users WHERE email = 'james.wilson@email.com' LIMIT 1),
 'pending',
 now() - interval '1 day',
 'Data Scientist expérimenté avec une forte expertise en Python et Machine Learning, je suis passionné par l''analyse prédictive.',
 'https://drive.google.com/file/d/james-wilson-cv'),

-- Thomas Wright applies to Full Stack Developer position
((SELECT id FROM jobs WHERE title = 'Développeur Full Stack React/Node.js' LIMIT 1),
 (SELECT id FROM users WHERE email = 'thomas.wright@email.com' LIMIT 1),
 'pending',
 now() - interval '3 hours',
 'Développeur Frontend spécialisé en React avec 4 ans d''expérience. Je souhaite évoluer vers le Full Stack.',
 'https://drive.google.com/file/d/thomas-wright-cv'),

-- Olivia Martinez applies to Marketing position
((SELECT id FROM jobs WHERE title = 'Chef de Projet Digital' LIMIT 1),
 (SELECT id FROM users WHERE email = 'olivia.martinez@email.com' LIMIT 1),
 'pending',
 now() - interval '6 hours',
 'Rédactrice de contenu avec une forte expertise en SEO, je pense pouvoir contribuer efficacement aux campagnes marketing digitales.',
 'https://drive.google.com/file/d/olivia-martinez-cv');