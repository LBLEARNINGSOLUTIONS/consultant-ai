-- ConsultantAI Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Analyst',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview transcripts and analyses
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  transcript_text TEXT NOT NULL,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'failed')),

  -- Analysis results (JSONB for flexibility)
  workflows JSONB DEFAULT '[]'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  tools JSONB DEFAULT '[]'::jsonb,
  roles JSONB DEFAULT '[]'::jsonb,
  training_gaps JSONB DEFAULT '[]'::jsonb,
  handoff_risks JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  raw_analysis_response JSONB,
  error_message TEXT,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company-wide summaries (aggregated analyses)
CREATE TABLE IF NOT EXISTS company_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,

  -- Included interview IDs
  interview_ids UUID[] NOT NULL,

  -- Aggregated data
  summary_data JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcript files (metadata for uploaded files)
CREATE TABLE IF NOT EXISTS transcript_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,

  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  storage_path TEXT,

  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(analysis_status);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_summaries_user_id ON company_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_company_summaries_created_at ON company_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcript_files_user_id ON transcript_files(user_id);
CREATE INDEX IF NOT EXISTS idx_transcript_files_interview_id ON transcript_files(interview_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_files ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Interviews policies
DROP POLICY IF EXISTS "Users can view own interviews" ON interviews;
CREATE POLICY "Users can view own interviews" ON interviews FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interviews" ON interviews;
CREATE POLICY "Users can insert own interviews" ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own interviews" ON interviews;
CREATE POLICY "Users can update own interviews" ON interviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interviews" ON interviews;
CREATE POLICY "Users can delete own interviews" ON interviews FOR DELETE USING (auth.uid() = user_id);

-- Company summaries policies
DROP POLICY IF EXISTS "Users can view own summaries" ON company_summaries;
CREATE POLICY "Users can view own summaries" ON company_summaries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own summaries" ON company_summaries;
CREATE POLICY "Users can insert own summaries" ON company_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own summaries" ON company_summaries;
CREATE POLICY "Users can update own summaries" ON company_summaries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own summaries" ON company_summaries;
CREATE POLICY "Users can delete own summaries" ON company_summaries FOR DELETE USING (auth.uid() = user_id);

-- Transcript files policies
DROP POLICY IF EXISTS "Users can view own files" ON transcript_files;
CREATE POLICY "Users can view own files" ON transcript_files FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own files" ON transcript_files;
CREATE POLICY "Users can insert own files" ON transcript_files FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own files" ON transcript_files;
CREATE POLICY "Users can update own files" ON transcript_files FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own files" ON transcript_files;
CREATE POLICY "Users can delete own files" ON transcript_files FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_summaries_updated_at ON company_summaries;
CREATE TRIGGER update_company_summaries_updated_at BEFORE UPDATE ON company_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKET (Optional - for file storage)
-- ============================================================================

-- Create storage bucket for transcript files (if you want to store files)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('transcripts', 'transcripts', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies (uncomment if using storage)
-- DROP POLICY IF EXISTS "Users can upload own transcripts" ON storage.objects;
-- CREATE POLICY "Users can upload own transcripts" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DROP POLICY IF EXISTS "Users can view own transcripts" ON storage.objects;
-- CREATE POLICY "Users can view own transcripts" ON storage.objects FOR SELECT
--   USING (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DROP POLICY IF EXISTS "Users can delete own transcripts" ON storage.objects;
-- CREATE POLICY "Users can delete own transcripts" ON storage.objects FOR DELETE
--   USING (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Verify tables were created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'interviews', 'company_summaries', 'transcript_files')
ORDER BY table_name;
