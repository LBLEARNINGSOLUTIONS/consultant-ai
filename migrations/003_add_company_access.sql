-- Migration: Add company_access table for role-based access control
-- This allows admins to assign clients to specific companies

-- Create company_access junction table
CREATE TABLE IF NOT EXISTS company_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS
ALTER TABLE company_access ENABLE ROW LEVEL SECURITY;

-- Admins can manage all access records
CREATE POLICY "Admins can manage all access" ON company_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can view their own access records
CREATE POLICY "Users can view their own access" ON company_access
  FOR SELECT USING (user_id = auth.uid());

-- Update companies RLS policy to support role-based access
-- First, drop any existing restrictive policies
DROP POLICY IF EXISTS "Users can view own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON companies;

-- Create new role-aware policies for companies
CREATE POLICY "Admin full access to own companies" ON companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    AND user_id = auth.uid()
  );

CREATE POLICY "Client read access to assigned companies" ON companies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM company_access WHERE user_id = auth.uid() AND company_id = companies.id)
  );

CREATE POLICY "Client update access to assigned companies" ON companies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM company_access WHERE user_id = auth.uid() AND company_id = companies.id)
  );

-- Grant admins ability to view all profiles (for user management)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_access_user_id ON company_access(user_id);
CREATE INDEX IF NOT EXISTS idx_company_access_company_id ON company_access(company_id);
