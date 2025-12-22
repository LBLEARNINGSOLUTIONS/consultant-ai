-- Fix RLS Policy for Profiles Table
-- This allows users to create their own profile during sign up

-- Drop the existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Also, let's create a trigger to automatically create a profile when a user signs up
-- This is a better approach than relying on the application code

-- First, create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'Analyst'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the policy exists
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'profiles';
