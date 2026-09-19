-- ============================================================================
-- FounderSync Database Migration: 001_initial_schema.sql
-- ============================================================================

-- 1. Enable uuid-ossp Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create reality_checks Table
CREATE TABLE IF NOT EXISTS reality_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  strategy TEXT NOT NULL,
  gemini_model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
  grok_model TEXT NOT NULL DEFAULT 'grok-beta',
  synthesis TEXT NOT NULL,
  blind_spots JSONB NOT NULL DEFAULT '[]'::jsonb,
  human_impact TEXT NOT NULL,
  stress_test_score INTEGER NOT NULL CHECK (stress_test_score BETWEEN 0 AND 100),
  is_simulated BOOLEAN NOT NULL DEFAULT false
);

-- 3. Create decision_audit_logs Table
CREATE TABLE IF NOT EXISTS decision_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reality_check_id UUID REFERENCES reality_checks(id) ON DELETE CASCADE,
  founder_action TEXT NOT NULL,
  justification TEXT NOT NULL
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reality_checks_created_at 
  ON reality_checks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_audit_logs_created_at 
  ON decision_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_audit_logs_reality_check_id 
  ON decision_audit_logs(reality_check_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE reality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow public read access on reality_checks" 
  ON reality_checks FOR SELECT USING (true);

CREATE POLICY "Allow public insert on reality_checks" 
  ON reality_checks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on decision_audit_logs" 
  ON decision_audit_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert on decision_audit_logs" 
  ON decision_audit_logs FOR INSERT WITH CHECK (true);
