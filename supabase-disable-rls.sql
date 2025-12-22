-- Temporary fix: Disable RLS on profiles table
-- This allows sign-ups to work while we debug the issue

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';
