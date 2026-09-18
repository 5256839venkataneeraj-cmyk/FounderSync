-- FounderSync: Realistic Mock Seed Data for Supabase
-- Fixed workspace: '00000000-0000-0000-0000-000000000001'

-- Clear existing data for fresh seed
TRUNCATE decisions, reality_checks, strategic_analyses, heatmap_scores, metrics CASCADE;

-- 1. Seed Metrics (12-month seeded time-series)
INSERT INTO metrics (workspace_id, month, arr, churn_rate, ltv, burn_rate, team_burnout_index, customer_trust_score, founder_cognitive_load, retention_sentiment, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Oct 25', 920000, 4.8, 16000, 60000, 45, 78, 52, 75, NOW() - INTERVAL '11 months'),
  ('00000000-0000-0000-0000-000000000001', 'Nov 25', 980000, 4.6, 17200, 62000, 48, 79, 55, 74, NOW() - INTERVAL '10 months'),
  ('00000000-0000-0000-0000-000000000001', 'Dec 25', 1050000, 4.4, 18500, 65000, 52, 80, 58, 72, NOW() - INTERVAL '9 months'),
  ('00000000-0000-0000-0000-000000000001', 'Jan 26', 1140000, 4.2, 19800, 68000, 56, 81, 62, 70, NOW() - INTERVAL '8 months'),
  ('00000000-0000-0000-0000-000000000001', 'Feb 26', 1220000, 4.0, 21000, 72000, 61, 82, 66, 68, NOW() - INTERVAL '7 months'),
  ('00000000-0000-0000-0000-000000000001', 'Mar 26', 1290000, 4.1, 22100, 75000, 64, 83, 70, 65, NOW() - INTERVAL '6 months'),
  ('00000000-0000-0000-0000-000000000001', 'Apr 26', 1350000, 3.9, 23000, 78000, 67, 83, 73, 63, NOW() - INTERVAL '5 months'),
  ('00000000-0000-0000-0000-000000000001', 'May 26', 1390000, 4.0, 23600, 80000, 69, 84, 76, 62, NOW() - INTERVAL '4 months'),
  ('00000000-0000-0000-0000-000000000001', 'Jun 26', 1420000, 3.8, 24000, 82000, 72, 84, 78, 60, NOW() - INTERVAL '3 months'),
  ('00000000-0000-0000-0000-000000000001', 'Jul 26', 1440000, 3.9, 24200, 83000, 74, 83, 80, 59, NOW() - INTERVAL '2 months'),
  ('00000000-0000-0000-0000-000000000001', 'Aug 26', 1450000, 3.8, 24500, 84000, 71, 84, 78, 61, NOW() - INTERVAL '1 month'),
  ('00000000-0000-0000-0000-000000000001', 'Sep 26', 1450000, 3.8, 24500, 85000, 68, 84, 79, 62, NOW());

-- 2. Seed Strategic Analyses (Gemini Strategic Analyst Output)
INSERT INTO strategic_analyses (id, workspace_id, market_position, growth_opportunities, sustainability_warning, simulated, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Established product-market fit in mid-market B2B with healthy $24.5k LTV and durable 3.8% monthly churn, but growth velocity is plateauing near $1.45M ARR.',
  '["Expand ACV via enterprise security add-on tier", "Automate non-core onboarding flows to lift gross margins from 72% to 81%", "Introduce design partner council to co-develop workflow integrations"]'::jsonb,
  'Elevated Team Burnout Index (68/100) and high Founder Cognitive Load (79/100) signal that further top-line acceleration without headcount or scope relief will trigger key contributor attrition.',
  true,
  NOW() - INTERVAL '2 days'
);

-- 3. Seed Reality Checks (Grok Contradictory Advisor Output)
INSERT INTO reality_checks (id, workspace_id, input_text, blind_spots, opposing_strategy, human_impact, stress_test_score, simulated, created_at)
VALUES
(
  '22222222-2222-2222-2222-222222222221',
  '00000000-0000-0000-0000-000000000001',
  'Mandate 80-hour work weeks for Q3 to pull forward enterprise feature release by 6 weeks.',
  '["Critical engineering churn risk among senior core architecture leads", "Technical debt and regression rate increases exponentially under sustained fatigue", "Customer satisfaction degradation if rushed features produce production downtime"]'::jsonb,
  'Cut non-essential scope by 35% and preserve release deadline with normal working hours and staggered team sprints.',
  'Severe team exhaustion risk (Burnout Index predicted to spike to 92); voluntary departures likely within 60 days.',
  32,
  true,
  NOW() - INTERVAL '14 days'
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Increase subscription pricing by 45% immediately for all grandfathered SMB customers.',
  '["Vocal community backlash on founder social channels and review aggregators", "Spike in gross monthly churn neutralizing short-term expansion MRR", "Competitors will run targeted migration campaigns targeting alienated early adopters"]'::jsonb,
  'Introduce grandfathered tier with feature caps, while applying new pricing exclusively to new signups and opt-in upgrade tiers.',
  'Heavy strain on customer success and support representatives dealing with churn friction.',
  48,
  true,
  NOW() - INTERVAL '5 days'
);

-- 4. Seed Decisions (Human-in-the-Loop Decision Audit Log)
INSERT INTO decisions (id, workspace_id, reality_check_id, action, justification, created_at)
VALUES
(
  '33333333-3333-3333-3333-333333333331',
  '00000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222221',
  'PIVOT_STRATEGY',
  'Reviewed devil advocate warnings; agreed that risking senior architect departures permanently threatens our enterprise roadmap. Scoped down MVP instead.',
  NOW() - INTERVAL '14 days'
),
(
  '33333333-3333-3333-3333-333333333332',
  '00000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'ACCEPT_AND_OVERRIDE_AI',
  'We have analyzed unit economics and determined that our legacy tier cost-to-serve exceeds revenues. We accept churn risk to focus on mid-market profitability.',
  NOW() - INTERVAL '5 days'
);

-- 5. Seed Heatmap Scores (Echo-Chamber Matrix)
INSERT INTO heatmap_scores (id, workspace_id, market_feasibility, team_sustainability, unit_economics, customer_value, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444441',
  '00000000-0000-0000-0000-000000000001',
  86,
  48,
  74,
  82,
  NOW()
);
