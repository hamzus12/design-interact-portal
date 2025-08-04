-- Create a candidate_profiles table to store candidate information
CREATE TABLE public.candidate_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  bio TEXT,
  skills TEXT[],
  experience_years INTEGER,
  location TEXT,
  avatar_color TEXT DEFAULT 'bg-blue-500',
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for candidate profiles
CREATE POLICY "Anyone can view candidate profiles" 
ON public.candidate_profiles 
FOR SELECT 
USING (true);