
-- Table pour stocker les analyses de correspondance emploi
CREATE TABLE public.job_match_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendation TEXT,
  detailed_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Table pour stocker les candidatures générées
CREATE TABLE public.generated_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  application_type TEXT NOT NULL DEFAULT 'cover_letter',
  content TEXT NOT NULL,
  is_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour stocker l'historique des conversations simulées
CREATE TABLE public.conversation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.job_match_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour job_match_analyses
CREATE POLICY "Users can view their own job analyses" 
  ON public.job_match_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job analyses" 
  ON public.job_match_analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job analyses" 
  ON public.job_match_analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Politiques RLS pour generated_applications
CREATE POLICY "Users can view their own applications" 
  ON public.generated_applications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
  ON public.generated_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
  ON public.generated_applications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Politiques RLS pour conversation_history
CREATE POLICY "Users can view their own conversation history" 
  ON public.conversation_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation history" 
  ON public.conversation_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_job_match_analyses_user_job ON public.job_match_analyses(user_id, job_id);
CREATE INDEX idx_generated_applications_user_job ON public.generated_applications(user_id, job_id);
CREATE INDEX idx_conversation_history_user_job ON public.conversation_history(user_id, job_id);
