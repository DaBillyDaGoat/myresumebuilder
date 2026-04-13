-- MyResumeBuilder Supabase Schema
-- Run this in your Supabase SQL editor

CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  language TEXT DEFAULT 'en',
  export_method TEXT, -- 'pdf' | 'email'
  completion_time_seconds INTEGER,
  section_order TEXT[], -- final section order chosen
  raw_data JSONB, -- full form data (sanitized)
  generated_resume JSONB -- AI output
);

CREATE TABLE usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT, -- 'start' | 'complete' | 'abandon' | 'pdf_download' | 'email_send'
  session_id TEXT,
  step_number INTEGER,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_created_at ON resumes(created_at);
CREATE INDEX idx_resumes_language ON resumes(language);
CREATE INDEX idx_usage_metrics_event_type ON usage_metrics(event_type);
CREATE INDEX idx_usage_metrics_created_at ON usage_metrics(created_at);
