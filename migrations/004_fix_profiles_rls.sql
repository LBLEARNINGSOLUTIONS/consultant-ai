-- Migration: Ensure RLS is enabled on all tables with proper policies
-- Run this if RLS was previously disabled for debugging

-- Re-enable RLS on profiles (in case it was disabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify all tables have RLS enabled
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['profiles', 'interviews', 'company_summaries', 'transcript_files'])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    RAISE NOTICE 'RLS enabled on %', tbl;
  END LOOP;
END $$;

-- Verify RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'interviews', 'company_summaries', 'transcript_files');
