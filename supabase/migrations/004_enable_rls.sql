-- ============================================================================
-- FounderSync Database Migration: 004_enable_rls.sql
-- Table: company_monthly_metrics
-- Description: Add user_id column with FK to auth.users, enable RLS, and establish
--              strict per-user isolation policies for SELECT, INSERT, UPDATE, DELETE.
-- ============================================================================

-- 1. Add user_id column referencing auth.users(id) with ON DELETE CASCADE
ALTER TABLE company_monthly_metrics
  ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- Optional but recommended: Index on user_id for high-performance RLS filtering
CREATE INDEX IF NOT EXISTS idx_company_monthly_metrics_user_id 
  ON company_monthly_metrics(user_id);

-- 2. Enable Row Level Security (RLS) on company_monthly_metrics
ALTER TABLE company_monthly_metrics ENABLE ROW LEVEL SECURITY;

-- 3. Create strict RLS policies for authenticated users

-- Policy 1: SELECT (View only own records)
DROP POLICY IF EXISTS "Users can view their own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can view their own company monthly metrics"
  ON company_monthly_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: INSERT (Create records only for own user_id)
DROP POLICY IF EXISTS "Users can insert their own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can insert their own company monthly metrics"
  ON company_monthly_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE (Modify only own records, cannot reassign to another user)
DROP POLICY IF EXISTS "Users can update their own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can update their own company monthly metrics"
  ON company_monthly_metrics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE (Delete only own records)
DROP POLICY IF EXISTS "Users can delete their own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can delete their own company monthly metrics"
  ON company_monthly_metrics
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
