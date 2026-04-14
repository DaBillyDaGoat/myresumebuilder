-- MyResumeBuilder Supabase Schema
-- Run this in your Supabase SQL editor

CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  language TEXT DEFAULT 'en',
  export_method TEXT,             -- 'pdf' | 'email'
  completion_time_seconds INTEGER,
  section_order TEXT[],           -- final section order chosen by user
  raw_data JSONB,                 -- full form data (skills, work, education, etc.)
  generated_resume JSONB          -- AI-generated resume output
);

CREATE TABLE usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,       -- 'session_start' | 'step_complete' | 'resume_generated' | 'export_pdf' | 'export_email' | 'section_reordered'
  session_id TEXT,                -- client-generated UUID per session
  step_number INTEGER,            -- for step_complete events
  section_id TEXT,                -- for section_reordered events
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX idx_resumes_language ON resumes(language);
CREATE INDEX idx_resumes_export_method ON resumes(export_method);
CREATE INDEX idx_usage_metrics_event_type ON usage_metrics(event_type);
CREATE INDEX idx_usage_metrics_session_id ON usage_metrics(session_id);
CREATE INDEX idx_usage_metrics_created_at ON usage_metrics(created_at DESC);
