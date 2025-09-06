-- Mettre à jour les statistiques PostgreSQL pour toutes les tables
ANALYZE users;
ANALYZE jobs;
ANALYZE applications;
ANALYZE conversations;
ANALYZE notifications;
ANALYZE bookmarks;
ANALYZE chat_messages;
ANALYZE video_calls;
ANALYZE generated_applications;
ANALYZE conversation_history;
ANALYZE job_match_analyses;
ANALYZE candidate_profiles;
ANALYZE blog_posts;
ANALYZE messages;

-- Forcer la mise à jour des statistiques système
SELECT pg_stat_reset();
VACUUM ANALYZE;