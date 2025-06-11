
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

-- Enable RLS on conversations table if not already enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to view conversations where they are either the candidate or recruiter
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (
    candidate_id = (SELECT id FROM public.users WHERE user_id = auth.uid()) OR
    recruiter_id = (SELECT id FROM public.users WHERE user_id = auth.uid())
  );

-- Allow users to create conversations where they are either the candidate or recruiter
CREATE POLICY "Users can create conversations they participate in" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (
    candidate_id = (SELECT id FROM public.users WHERE user_id = auth.uid()) OR
    recruiter_id = (SELECT id FROM public.users WHERE user_id = auth.uid())
  );

-- Allow users to update conversations where they are either the candidate or recruiter
CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (
    candidate_id = (SELECT id FROM public.users WHERE user_id = auth.uid()) OR
    recruiter_id = (SELECT id FROM public.users WHERE user_id = auth.uid())
  );

-- Enable RLS on chat_messages table if not already enabled
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (
        candidate_id = (SELECT id FROM public.users WHERE user_id = auth.uid()) OR
        recruiter_id = (SELECT id FROM public.users WHERE user_id = auth.uid())
      )
    )
  );

-- Allow users to insert messages in conversations they participate in
CREATE POLICY "Users can send messages in their conversations" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = (SELECT id FROM public.users WHERE user_id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (
        candidate_id = (SELECT id FROM public.users WHERE user_id = auth.uid()) OR
        recruiter_id = (SELECT id FROM public.users WHERE user_id = auth.uid())
      )
    )
  );

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (sender_id = (SELECT id FROM public.users WHERE user_id = auth.uid()));
