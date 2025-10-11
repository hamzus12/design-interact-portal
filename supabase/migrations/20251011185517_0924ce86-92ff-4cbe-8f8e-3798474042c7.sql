
-- Mettre à jour les statistiques de toutes les tables pour corriger l'affichage "0 rows estimated"
-- Note: VACUUM ne peut pas être exécuté dans une migration, donc on utilise seulement ANALYZE

ANALYZE public.users;
ANALYZE public.jobs;
ANALYZE public.applications;
ANALYZE public.candidate_profiles;
ANALYZE public.conversations;
ANALYZE public.chat_messages;
ANALYZE public.messages;
ANALYZE public.notifications;
ANALYZE public.bookmarks;
ANALYZE public.video_calls;
ANALYZE public.conversation_history;
ANALYZE public.generated_applications;
ANALYZE public.job_match_analyses;
ANALYZE public.blog_posts;
ANALYZE public.performance_metrics;
ANALYZE public.security_audit_log;
