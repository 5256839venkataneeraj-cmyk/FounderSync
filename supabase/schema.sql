-- FounderSync: PostgreSQL Schema for Supabase (Single-Tenant with Fixed Workspace Scope)
-- Track: Industry 6.0 (Human-AI Collaboration, Sustainability, Human-Centric Systems)
--
-- NOTE ON MULTI-TENANCY:
-- Currently, this application runs in single-tenant mode scoped to a fixed workspace_id constant.
-- When multi-tenancy is introduced, Supabase Auth can be layered in by:
-- 1. Linking workspace_id to a workspaces table with a membership/owner relation to auth.users.
-- 2. Updating the RLS policies below from the fixed constant comparison to:
--    USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fixed workspace constant default:
-- '00000000-0000-0000-0000-000000000001'::uuid

-- 1. Metrics Table (Strategic Mirror & 12-month time series)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  month TEXT NOT NULL,
  arr NUMERIC NOT NULL DEFAULT 0,
  churn_rate NUMERIC NOT NULL DEFAULT 0,
  ltv NUMERIC NOT NULL DEFAULT 0,
  burn_rate NUMERIC NOT NULL DEFAULT 0,
  team_burnout_index NUMERIC NOT NULL DEFAULT 50,
  customer_trust_score NUMERIC NOT NULL DEFAULT 50,
  founder_cognitive_load NUMERIC NOT NULL DEFAULT 50,
  retention_sentiment NUMERIC NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Strategic Analyses Table (Gemini Strategic Analyst Output)
CREATE TABLE IF NOT EXISTS strategic_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  market_position TEXT NOT NULL,
  growth_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  sustainability_warning TEXT,
  simulated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Reality Checks Table (Grok Contradictory Advisor Output)
CREATE TABLE IF NOT EXISTS reality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  input_text TEXT NOT NULL,
  blind_spots JSONB NOT NULL DEFAULT '[]'::jsonb,
  opposing_strategy TEXT NOT NULL,
  human_impact TEXT NOT NULL,
  stress_test_score INTEGER NOT NULL CHECK (stress_test_score BETWEEN 1 AND 100),
  simulated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Decisions Table (Human-in-the-Loop Decision Audit Log)
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  reality_check_id UUID REFERENCES reality_checks(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('ACCEPT_AND_OVERRIDE_AI', 'PIVOT_STRATEGY')),
  justification TEXT NOT NULL CHECK (length(trim(justification)) >= 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Heatmap Scores Table (Echo-Chamber Heatmap / Blind Spot Matrix)
CREATE TABLE IF NOT EXISTS heatmap_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  market_feasibility INTEGER NOT NULL CHECK (market_feasibility BETWEEN 0 AND 100),
  team_sustainability INTEGER NOT NULL CHECK (team_sustainability BETWEEN 0 AND 100),
  unit_economics INTEGER NOT NULL CHECK (unit_economics BETWEEN 0 AND 100),
  customer_value INTEGER NOT NULL CHECK (customer_value BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_workspace ON metrics(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_strategic_analyses_workspace ON strategic_analyses(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reality_checks_workspace ON reality_checks(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_workspace ON decisions(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_heatmap_scores_workspace ON heatmap_scores(workspace_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Scoped to fixed workspace_id '00000000-0000-0000-0000-000000000001'
-- ============================================================================

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_scores ENABLE ROW LEVEL SECURITY;

-- 1. Metrics RLS
CREATE POLICY "Allow workspace read access to metrics" ON metrics
  FOR SELECT USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow workspace write access to metrics" ON metrics
  FOR ALL USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 2. Strategic Analyses RLS
CREATE POLICY "Allow workspace read access to strategic_analyses" ON strategic_analyses
  FOR SELECT USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow workspace write access to strategic_analyses" ON strategic_analyses
  FOR ALL USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 3. Reality Checks RLS
CREATE POLICY "Allow workspace read access to reality_checks" ON reality_checks
  FOR SELECT USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow workspace write access to reality_checks" ON reality_checks
  FOR ALL USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 4. Decisions RLS
CREATE POLICY "Allow workspace read access to decisions" ON decisions
  FOR SELECT USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow workspace write access to decisions" ON decisions
  FOR ALL USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 5. Heatmap Scores RLS
CREATE POLICY "Allow workspace read access to heatmap_scores" ON heatmap_scores
  FOR SELECT USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow workspace write access to heatmap_scores" ON heatmap_scores
  FOR ALL USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);
