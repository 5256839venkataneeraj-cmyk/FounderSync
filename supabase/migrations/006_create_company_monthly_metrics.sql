-- ============================================================================
-- FounderSync Database Migration: 006_create_company_monthly_metrics.sql
-- Table: company_monthly_metrics
-- Description: Creates the company_monthly_metrics table for direct telemetry &
--              qualitative survey ingestion, with RLS policies bound to auth.uid().
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_monthly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  company_name TEXT NOT NULL DEFAULT 'FounderSync Venture',
  reporting_month TEXT NOT NULL,
  
  -- Raw Financial & Operational Inputs
  mrr NUMERIC NOT NULL DEFAULT 0,
  total_active_customers INTEGER NOT NULL DEFAULT 0,
  monthly_revenue NUMERIC NOT NULL DEFAULT 0,
  customers_lost INTEGER NOT NULL DEFAULT 0,
  starting_customers INTEGER NOT NULL DEFAULT 0,
  avg_revenue_per_customer NUMERIC NOT NULL DEFAULT 0,
  monthly_expenses NUMERIC NOT NULL DEFAULT 0,
  cash_in_bank NUMERIC NOT NULL DEFAULT 0,

  -- Raw Qualitative Survey Question Answers (Arrays of 1-10 scores)
  burnout_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  trust_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  cognitive_load_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  retention_answers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Calculated Metrics & Subscores
  arr NUMERIC NOT NULL DEFAULT 0,
  churn_rate NUMERIC NOT NULL DEFAULT 0,
  ltv NUMERIC NOT NULL DEFAULT 0,
  clv NUMERIC NOT NULL DEFAULT 0,
  burn_rate NUMERIC NOT NULL DEFAULT 0,
  monthly_burn NUMERIC NOT NULL DEFAULT 0,
  runway_months NUMERIC,
  burnout_score NUMERIC NOT NULL DEFAULT 50,
  burnout_index NUMERIC NOT NULL DEFAULT 50,
  trust_score NUMERIC NOT NULL DEFAULT 50,
  customer_trust_score NUMERIC NOT NULL DEFAULT 50,
  cognitive_load_score NUMERIC NOT NULL DEFAULT 50,
  founder_cognitive_load NUMERIC NOT NULL DEFAULT 50,
  retention_score NUMERIC NOT NULL DEFAULT 50,
  retention_sentiment NUMERIC NOT NULL DEFAULT 50,
  retention_sentiment_score NUMERIC NOT NULL DEFAULT 50,
  human_centric_subscore NUMERIC NOT NULL DEFAULT 50,
  burnout_score_band TEXT NOT NULL DEFAULT 'low',

  -- Full JSON payloads for inspection & auditability
  raw_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance and RLS Indexes
CREATE INDEX IF NOT EXISTS idx_company_monthly_metrics_user_id 
  ON company_monthly_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_company_monthly_metrics_workspace_id 
  ON company_monthly_metrics(workspace_id);

CREATE INDEX IF NOT EXISTS idx_company_monthly_metrics_created_at 
  ON company_monthly_metrics(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE company_monthly_metrics ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT (View only own records)
DROP POLICY IF EXISTS "Users can view own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can view own company monthly metrics"
  ON company_monthly_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: INSERT (Insert only with own user_id)
DROP POLICY IF EXISTS "Users can insert own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can insert own company monthly metrics"
  ON company_monthly_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE (Modify only own records)
DROP POLICY IF EXISTS "Users can update own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can update own company monthly metrics"
  ON company_monthly_metrics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE (Delete only own records)
DROP POLICY IF EXISTS "Users can delete own company monthly metrics" ON company_monthly_metrics;
CREATE POLICY "Users can delete own company monthly metrics"
  ON company_monthly_metrics
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
