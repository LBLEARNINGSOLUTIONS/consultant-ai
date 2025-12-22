-- Clean up existing users and profiles to start fresh
-- This removes any partially created accounts

-- First, disable RLS on profiles so we can delete
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Delete all profiles
DELETE FROM profiles;

-- Delete all users from auth (this requires special permissions)
-- Note: You might need to do this manually in the Supabase dashboard

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Make sure the insert policy exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Verify everything is clean
SELECT COUNT(*) as profile_count FROM profiles;
