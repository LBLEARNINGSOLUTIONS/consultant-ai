-- Migration: Add Companies Organization System
-- Run this SQL in Supabase SQL Editor to add company folder functionality

-- ============================================================================
-- CREATE COMPANIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADD COMPANY_ID TO INTERVIEWS
-- ============================================================================

-- Add company_id column (nullable - NULL means "Unassigned")
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_interviews_company_id ON interviews(company_id);

-- ============================================================================
-- ROW LEVEL SECURITY FOR COMPANIES
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own companies" ON companies;
CREATE POLICY "Users can view own companies" ON companies
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
CREATE POLICY "Users can insert own companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own companies" ON companies;
CREATE POLICY "Users can update own companies" ON companies
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own companies" ON companies;
CREATE POLICY "Users can delete own companies" ON companies
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFY MIGRATION
-- ============================================================================

SELECT 'Migration complete!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'companies') as companies_table_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'interviews' AND column_name = 'company_id') as company_id_column_exists;
