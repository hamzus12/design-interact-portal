-- Phase 3: Optimisations de sécurité et performance (version corrigée)

-- Créer une table pour stocker les métriques de performance
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  component TEXT NOT NULL,
  operation TEXT NOT NULL,
  duration_ms NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS sur la table performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy pour que les utilisateurs ne voient que leurs propres métriques
CREATE POLICY "Users can view their own performance metrics"
ON public.performance_metrics
FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid()));

-- Policy pour que les utilisateurs puissent insérer leurs propres métriques
CREATE POLICY "Users can insert their own performance metrics"
ON public.performance_metrics
FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid()));

-- Index pour optimiser les requêtes de métriques
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_component ON public.performance_metrics(user_id, component);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at);

-- Créer une fonction pour nettoyer les anciennes métriques (garder seulement 30 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.performance_metrics 
  WHERE created_at < now() - interval '30 days';
END;
$$;

-- Créer une table pour les audits de sécurité
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS pour les logs de sécurité
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les logs de sécurité
CREATE POLICY "Only admins can view security logs"
ON public.security_audit_log
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Fonction pour logger les actions de sécurité
CREATE OR REPLACE FUNCTION public.log_security_action(
  p_action TEXT,
  p_resource TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Récupérer l'ID utilisateur actuel
  SELECT id INTO current_user_id
  FROM public.users
  WHERE user_id = auth.uid();
  
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    details
  ) VALUES (
    current_user_id,
    p_action,
    p_resource,
    p_details
  );
END;
$$;