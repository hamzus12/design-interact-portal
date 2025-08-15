
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Candidates can create their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Users can view their own generated applications" ON public.generated_applications;
DROP POLICY IF EXISTS "Users can create their own generated applications" ON public.generated_applications;
DROP POLICY IF EXISTS "Users can update their own generated applications" ON public.generated_applications;

-- Enable RLS on both tables
ALTER TABLE public.generated_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies for generated_applications table
CREATE POLICY "Users can view own generated applications" 
  ON public.generated_applications 
  FOR SELECT 
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own generated applications" 
  ON public.generated_applications 
  FOR INSERT 
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own generated applications" 
  ON public.generated_applications 
  FOR UPDATE 
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE user_id = auth.uid()
    )
  );

-- Create policies for applications table
CREATE POLICY "Candidates can view own applications" 
  ON public.applications 
  FOR SELECT 
  USING (
    candidate_id IN (
      SELECT id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can create own applications" 
  ON public.applications 
  FOR INSERT 
  WITH CHECK (
    candidate_id IN (
      SELECT id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view job applications" 
  ON public.applications 
  FOR SELECT 
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE recruiter_id IN (
        SELECT id FROM public.users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can update job applications" 
  ON public.applications 
  FOR UPDATE 
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE recruiter_id IN (
        SELECT id FROM public.users WHERE user_id = auth.uid()
      )
    )
  );
