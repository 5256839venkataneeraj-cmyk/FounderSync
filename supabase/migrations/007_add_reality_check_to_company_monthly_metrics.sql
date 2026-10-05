-- ============================================================================
-- FounderSync Database Migration: 007_add_reality_check_to_company_monthly_metrics.sql
-- Description: Adds dynamic Reality Check columns to company_monthly_metrics
--              to persist AI-generated questions, descriptions, and category tags.
-- ============================================================================

ALTER TABLE IF EXISTS company_monthly_metrics 
ADD COLUMN IF NOT EXISTS reality_check_question TEXT,
ADD COLUMN IF NOT EXISTS reality_check_description TEXT,
ADD COLUMN IF NOT EXISTS reality_check_category TEXT DEFAULT 'CONTRADICTION';

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_company_monthly_metrics_reality_check_cat 
  ON company_monthly_metrics(reality_check_category);
