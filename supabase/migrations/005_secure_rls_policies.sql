-- ============================================================================
-- FounderSync Database Migration: 005_secure_rls_policies.sql
-- Description: Hardens Row Level Security (RLS) across all operational tables.
--              Removes permissive USING (true) and unauthenticated policies.
--              Enforces auth.uid() = user_id isolation and immutable audit logs.
-- ============================================================================

-- 1. Drop insecure public or unauthenticated workspace-wide policies
DROP POLICY IF EXISTS "Allow public read access on reality_checks" ON reality_checks;
DROP POLICY IF EXISTS "Allow public insert on reality_checks" ON reality_checks;
DROP POLICY IF EXISTS "Allow public read access on decision_audit_logs" ON decision_audit_logs;
DROP POLICY IF EXISTS "Allow public insert on decision_audit_logs" ON decision_audit_logs;
DROP POLICY IF EXISTS "Allow workspace read access to metrics" ON metrics;
DROP POLICY IF EXISTS "Allow workspace write access to metrics" ON metrics;
DROP POLICY IF EXISTS "Allow workspace read access to strategic_analyses" ON strategic_analyses;
DROP POLICY IF EXISTS "Allow workspace write access to strategic_analyses" ON strategic_analyses;
DROP POLICY IF EXISTS "Allow workspace read access to reality_checks" ON reality_checks;
DROP POLICY IF EXISTS "Allow workspace write access to reality_checks" ON reality_checks;
DROP POLICY IF EXISTS "Allow workspace read access to decisions" ON decisions;
DROP POLICY IF EXISTS "Allow workspace write access to decisions" ON decisions;
DROP POLICY IF EXISTS "Allow workspace read access to heatmap_scores" ON heatmap_scores;
DROP POLICY IF EXISTS "Allow workspace write access to heatmap_scores" ON heatmap_scores;

-- 2. Ensure RLS is enabled on all tables
ALTER TABLE reality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_scores ENABLE ROW LEVEL SECURITY;

-- 3. Add user_id column references if missing
ALTER TABLE reality_checks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reality_checks_user_id ON reality_checks(user_id);

ALTER TABLE decision_audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_decision_audit_logs_user_id ON decision_audit_logs(user_id);

ALTER TABLE metrics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id);

ALTER TABLE strategic_analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_strategic_analyses_user_id ON strategic_analyses(user_id);

ALTER TABLE decisions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);

ALTER TABLE heatmap_scores ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_heatmap_scores_user_id ON heatmap_scores(user_id);

-- 4. reality_checks: User-bound isolation
CREATE POLICY "Users can view own reality checks" ON reality_checks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reality checks" ON reality_checks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. decision_audit_logs: Tamper-proof, append-only log
CREATE POLICY "Users can view own decision audit logs" ON decision_audit_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decision audit logs" ON decision_audit_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Prevent updates to decision audit logs" ON decision_audit_logs
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Prevent deletions to decision audit logs" ON decision_audit_logs
  FOR DELETE TO authenticated USING (false);

-- 6. metrics
CREATE POLICY "Users can view own metrics" ON metrics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON metrics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON metrics
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. strategic_analyses
CREATE POLICY "Users can view own strategic analyses" ON strategic_analyses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategic analyses" ON strategic_analyses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 8. decisions
CREATE POLICY "Users can view own decisions" ON decisions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON decisions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 9. heatmap_scores
CREATE POLICY "Users can view own heatmap scores" ON heatmap_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own heatmap scores" ON heatmap_scores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
