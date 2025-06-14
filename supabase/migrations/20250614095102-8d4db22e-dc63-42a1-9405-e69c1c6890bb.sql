
-- Create video_calls table for storing scheduled video interviews
CREATE TABLE public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  scheduled_by UUID NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.video_calls 
ADD CONSTRAINT fk_video_calls_conversation 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.video_calls 
ADD CONSTRAINT fk_video_calls_scheduled_by 
FOREIGN KEY (scheduled_by) REFERENCES public.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_calls
CREATE POLICY "Users can view video calls for their conversations" 
  ON public.video_calls 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = video_calls.conversation_id 
      AND (c.candidate_id = get_current_user_id() OR c.recruiter_id = get_current_user_id())
    )
  );

CREATE POLICY "Users can create video calls for their conversations" 
  ON public.video_calls 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = video_calls.conversation_id 
      AND (c.candidate_id = get_current_user_id() OR c.recruiter_id = get_current_user_id())
    )
  );

CREATE POLICY "Users can update video calls they scheduled" 
  ON public.video_calls 
  FOR UPDATE 
  USING (scheduled_by = get_current_user_id());

CREATE POLICY "Users can delete video calls they scheduled" 
  ON public.video_calls 
  FOR DELETE 
  USING (scheduled_by = get_current_user_id());
