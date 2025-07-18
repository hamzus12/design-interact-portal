-- Créer la table notifications pour les notifications en temps réel
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Créer un index pour les requêtes fréquentes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Activer RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid()));

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Fonction pour créer automatiquement des notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  notification_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES (target_user_id, notification_title, notification_message, notification_type, notification_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Activer les mises à jour en temps réel pour les notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Fonction pour marquer les notifications comme lues
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = notification_id 
  AND user_id IN (SELECT id FROM public.users WHERE user_id = auth.uid());
  
  RETURN FOUND;
END;
$$;

-- Trigger pour les notifications automatiques lors d'une nouvelle candidature
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_title TEXT;
  recruiter_user_id UUID;
  candidate_name TEXT;
BEGIN
  -- Récupérer les détails du job et du recruteur
  SELECT j.title, j.recruiter_id INTO job_title, recruiter_user_id
  FROM public.jobs j
  WHERE j.id = NEW.job_id;
  
  -- Récupérer le nom du candidat
  SELECT COALESCE(u.first_name || ' ' || u.last_name, u.email) INTO candidate_name
  FROM public.users u
  WHERE u.id = NEW.candidate_id;
  
  -- Créer une notification pour le recruteur
  IF recruiter_user_id IS NOT NULL THEN
    PERFORM public.create_notification(
      recruiter_user_id,
      'Nouvelle candidature reçue',
      candidate_name || ' a postulé pour le poste "' || job_title || '"',
      'application',
      '/dashboard'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER trigger_notify_new_application
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_application();

-- Trigger pour les notifications automatiques lors d'un changement de statut
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_title TEXT;
  candidate_user_id UUID;
  status_message TEXT;
BEGIN
  -- Vérifier si le statut a changé
  IF NEW.status != OLD.status THEN
    -- Récupérer les détails du job
    SELECT j.title INTO job_title
    FROM public.jobs j
    WHERE j.id = NEW.job_id;
    
    -- Récupérer l'ID utilisateur du candidat
    SELECT u.user_id INTO candidate_user_id
    FROM public.users u
    WHERE u.id = NEW.candidate_id;
    
    -- Définir le message selon le statut
    CASE NEW.status
      WHEN 'accepted' THEN
        status_message := 'Félicitations ! Votre candidature pour "' || job_title || '" a été acceptée.';
      WHEN 'rejected' THEN
        status_message := 'Votre candidature pour "' || job_title || '" n''a pas été retenue cette fois.';
      WHEN 'interview' THEN
        status_message := 'Bonne nouvelle ! Vous êtes convoqué(e) pour un entretien pour "' || job_title || '".';
      ELSE
        status_message := 'Le statut de votre candidature pour "' || job_title || '" a été mis à jour.';
    END CASE;
    
    -- Créer une notification pour le candidat
    IF candidate_user_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.candidate_id,
        'Mise à jour de candidature',
        status_message,
        'status_update',
        '/my-applications'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER trigger_notify_application_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_status_change();