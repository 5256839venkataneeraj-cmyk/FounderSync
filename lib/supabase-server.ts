import { createClient } from '@supabase/supabase-js';
import {
  FIXED_WORKSPACE_ID,
  RealityCheckResult,
  StrategicAnalysisResult,
  DecisionAction,
  GrowthMetrics,
  HumanMetrics,
  TimeSeriesPoint,
} from '@/lib/types';
import { safeLogger } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Validates that server-side Supabase credentials exist.
 */
export const isSupabaseServerConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseServiceRoleKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseServiceRoleKey !== 'your-supabase-service-role-key'
  );
};

/**
 * Server-only Supabase admin client using the service-role key.
 * Bypasses RLS to guarantee persistence from trusted Next.js API route handlers.
 */
export const supabaseServer = isSupabaseServerConfigured()
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Persists a Strategic Analysis result to the strategic_analyses table.
 * Returns the inserted row ID, or null if persistence failed or Supabase is not configured.
 */
export async function persistStrategicAnalysis(
  analysis: StrategicAnalysisResult,
  workspaceId: string = FIXED_WORKSPACE_ID
): Promise<string | null> {
  if (!supabaseServer) return null;

  try {
    // Attempt insert with primary contract fields
    const primaryPayload = {
      workspace_id: workspaceId,
      summary: analysis.summary,
      strengths: analysis.strengths,
      risks: analysis.risks,
      recommendations: analysis.recommendations,
      confidence: analysis.confidence,
      model: analysis.model,
      simulated: analysis.simulated,
      market_position: analysis.summary,
      growth_opportunities: analysis.recommendations,
      sustainability_warning: analysis.risks?.[0] || null,
    };

    const { data, error } = await (supabaseServer as any)
      .from('strategic_analyses')
      .insert(primaryPayload)
      .select('id')
      .single();

    if (error) {
      // If error is due to unknown column, fallback to legacy schema
      const legacyPayload = {
        workspace_id: workspaceId,
        market_position: analysis.summary,
        growth_opportunities: analysis.recommendations,
        sustainability_warning: analysis.risks?.[0] || null,
        simulated: analysis.simulated,
      };
      const fallback = await (supabaseServer as any)
        .from('strategic_analyses')
        .insert(legacyPayload)
        .select('id')
        .single();

      if (fallback.error) {
        safeLogger.error('[Supabase Server] Failed to insert strategic_analysis:', fallback.error.message);
        return null;
      }
      return fallback.data?.id || null;
    }

    return data?.id || null;
  } catch (err: any) {
    safeLogger.error('[Supabase Server] Error inserting strategic_analysis:', err);
    return null;
  }
}

/**
 * Persists a Reality-Check result to the reality_checks table.
 * Returns the inserted row ID, or null if persistence failed.
 */
export async function persistRealityCheck(
  result: RealityCheckResult,
  workspaceId: string = FIXED_WORKSPACE_ID
): Promise<string | null> {
  if (!supabaseServer) return null;

  try {
    const primaryPayload = {
      workspace_id: workspaceId,
      strategy_evaluated: result.strategyEvaluated,
      counterarguments: result.counterarguments,
      blind_spots: result.blindSpots,
      verdict: result.verdict,
      model: result.model,
      simulated: result.simulated,
      input_text: result.strategyEvaluated,
      opposing_strategy: result.counterarguments?.[0] || '',
      human_impact: result.blindSpots?.[0] || '',
      stress_test_score: result.verdict === 'proceed' ? 85 : result.verdict === 'proceed_with_caution' ? 60 : 35,
    };

    const { data, error } = await (supabaseServer as any)
      .from('reality_checks')
      .insert(primaryPayload)
      .select('id')
      .single();

    if (error) {
      // Fallback for legacy schema
      const legacyPayload = {
        workspace_id: workspaceId,
        input_text: result.strategyEvaluated,
        blind_spots: result.blindSpots,
        opposing_strategy: result.counterarguments?.[0] || '',
        human_impact: result.blindSpots?.[0] || '',
        stress_test_score: result.verdict === 'proceed' ? 85 : result.verdict === 'proceed_with_caution' ? 60 : 35,
        simulated: result.simulated,
      };
      const fallback = await (supabaseServer as any)
        .from('reality_checks')
        .insert(legacyPayload)
        .select('id')
        .single();

      if (fallback.error) {
        safeLogger.error('[Supabase Server] Failed to insert reality_check:', fallback.error.message);
        return null;
      }
      return fallback.data?.id || null;
    }

    return data?.id || null;
  } catch (err: any) {
    safeLogger.error('[Supabase Server] Error inserting reality_check:', err);
    return null;
  }
}

/**
 * Persists a Human-in-the-Loop Decision to the decisions table.
 */
export async function persistDecision(
  realityCheckId: string | null,
  action: DecisionAction,
  justification: string,
  workspaceId: string = FIXED_WORKSPACE_ID
): Promise<string | null> {
  if (!supabaseServer) return null;

  try {
    const { data, error } = await (supabaseServer as any)
      .from('decisions')
      .insert({
        workspace_id: workspaceId,
        reality_check_id: realityCheckId,
        action,
        justification,
      })
      .select('id')
      .single();

    if (error) {
      safeLogger.error('[Supabase Server] Failed to insert decision:', error.message);
      return null;
    }
    return data?.id || null;
  } catch (err: any) {
    safeLogger.error('[Supabase Server] Error inserting decision:', err);
    return null;
  }
}

/**
 * Fetches current workspace metrics from Supabase or returns null if not configured.
 */
export async function fetchServerWorkspaceMetrics(
  workspaceId: string = FIXED_WORKSPACE_ID
): Promise<{ growthMetrics: GrowthMetrics; humanMetrics: HumanMetrics; timeSeries: TimeSeriesPoint[] } | null> {
  if (!supabaseServer) return null;

  try {
    const { data, error } = await (supabaseServer as any)
      .from('metrics')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    const latest = data[data.length - 1];
    return {
      growthMetrics: {
        arr: Number(latest.arr) || 1200000,
        churnRate: Number(latest.churn_rate) || 4.2,
        ltv: Number(latest.ltv) || 14500,
        burnRate: Number(latest.burn_rate) || 85000,
      },
      humanMetrics: {
        burnoutIndex: Number(latest.team_burnout_index) || 72,
        customerTrustScore: Number(latest.customer_trust_score) || 68,
        founderCognitiveLoad: Number(latest.founder_cognitive_load) || 85,
        retentionSentiment: Number(latest.retention_sentiment) || 61,
      },
      timeSeries: data.map((m: any) => ({
        month: m.month || 'M',
        revenueGrowth: Number(m.arr) || 0,
        teamWellnessIndex: 100 - (Number(m.team_burnout_index) || 50),
      })),
    };
  } catch (err) {
    safeLogger.error('[Supabase Server] Failed to fetch metrics on server:', err);
    return null;
  }
}

export interface CompanyBaselineMetrics {
  id?: string;
  sourceTable: 'company_monthly_metrics' | 'metrics' | 'mock_baseline';
  company_name: string;
  reporting_month: string;
  arr: number;
  mrr: number;
  burn_rate: number;
  burnRate: number;
  monthly_burn?: number;
  monthlyBurn?: number;
  runway_months: number | null;
  runwayMonths: number | null;
  churn_rate: number;
  churnRate: number;
  monthly_churn_rate?: number;
  ltv: number;
  clv: number;
  burnout_score: number;
  burnoutIndex: number;
  burnout_score_band: 'low' | 'moderate' | 'high';
  trust_score: number;
  customerTrustScore: number;
  cognitive_load_score: number;
  founderCognitiveLoad: number;
  retention_score: number;
  retentionSentiment: number;
  human_centric_subscore: number;
  reality_check_question?: string;
  realityCheckQuestion?: string;
  reality_check_description?: string;
  realityCheckDescription?: string;
  reality_check_category?: string;
  realityCheckCategory?: string;
  created_at?: string;
  [key: string]: any;
}

/**
 * Persists raw inputs and calculated metrics to the company_monthly_metrics table.
 * Includes user_id for RLS compliance and contains explicit error logging.
 * Gracefully falls back to metrics table if company_monthly_metrics table is pending creation.
 */
export async function persistCompanyMonthlyMetrics({
  client,
  userId,
  workspaceId = FIXED_WORKSPACE_ID,
  extracted,
  calculatedMetrics,
}: {
  client?: any;
  userId: string;
  workspaceId?: string;
  extracted: any;
  calculatedMetrics: any;
}): Promise<{ success: boolean; id?: string; error?: string; table?: string }> {
  const dbClient = client || supabaseServer;
  if (!dbClient) {
    console.warn('[Supabase Persistence] Database client not configured, skipping persistence.');
    return { success: false, error: 'Database client not configured' };
  }

  const reportingMonth =
    calculatedMetrics.reporting_month ||
    extracted.reporting_month ||
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const payload = {
    user_id: userId,
    workspace_id: workspaceId || FIXED_WORKSPACE_ID,
    company_name: calculatedMetrics.company_name || extracted.company_name || 'FounderSync Portfolio',
    reporting_month: reportingMonth,
    mrr: Number(calculatedMetrics.mrr ?? extracted.mrr ?? 0),
    total_active_customers: Number(calculatedMetrics.total_active_customers ?? extracted.total_active_customers ?? 0),
    monthly_revenue: Number(calculatedMetrics.monthly_revenue ?? extracted.monthly_revenue ?? 0),
    customers_lost: Number(calculatedMetrics.customers_lost ?? extracted.customers_lost ?? 0),
    starting_customers: Number(calculatedMetrics.starting_customers ?? extracted.starting_customers ?? 0),
    avg_revenue_per_customer: Number(calculatedMetrics.avg_revenue_per_customer ?? extracted.avg_revenue_per_customer ?? 0),
    monthly_expenses: Number(calculatedMetrics.monthly_expenses ?? extracted.monthly_expenses ?? 0),
    cash_in_bank: Number(calculatedMetrics.cash_in_bank ?? extracted.cash_in_bank ?? 0),
    burnout_answers: extracted.burnout_answers || [],
    trust_answers: extracted.trust_answers || [],
    cognitive_load_answers: extracted.cognitive_load_answers || [],
    retention_answers: extracted.retention_answers || [],
    arr: Number(calculatedMetrics.arr ?? 0),
    churn_rate: Number(calculatedMetrics.monthly_churn_rate ?? calculatedMetrics.churn_rate ?? 0),
    ltv: Number(calculatedMetrics.clv ?? calculatedMetrics.ltv ?? 0),
    clv: Number(calculatedMetrics.clv ?? calculatedMetrics.ltv ?? 0),
    burn_rate: Number(calculatedMetrics.burn_rate ?? 0),
    runway_months: calculatedMetrics.runway_months !== null && !isNaN(Number(calculatedMetrics.runway_months))
      ? Number(calculatedMetrics.runway_months)
      : null,
    burnout_score: Number(calculatedMetrics.burnout_score ?? 0),
    burnout_index: Number(calculatedMetrics.burnout_score ?? 0),
    trust_score: Number(calculatedMetrics.trust_score ?? 0),
    customer_trust_score: Number(calculatedMetrics.trust_score ?? 0),
    cognitive_load_score: Number(calculatedMetrics.cognitive_load_score ?? 0),
    founder_cognitive_load: Number(calculatedMetrics.cognitive_load_score ?? 0),
    retention_score: Number(calculatedMetrics.retention_score ?? 0),
    retention_sentiment: Number(calculatedMetrics.retention_score ?? 0),
    human_centric_subscore: Number(calculatedMetrics.human_centric_subscore ?? 0),
    burnout_score_band: calculatedMetrics.burnout_score_band || 'low',
    reality_check_question: calculatedMetrics.reality_check_question || calculatedMetrics.realityCheckQuestion || null,
    reality_check_description: calculatedMetrics.reality_check_description || calculatedMetrics.realityCheckDescription || null,
    reality_check_category: calculatedMetrics.reality_check_category || calculatedMetrics.realityCheckCategory || 'CONTRADICTION',
    raw_inputs: extracted,
    calculated_metrics: calculatedMetrics,
  };

  console.log(`[Supabase Persistence] Inserting metrics into company_monthly_metrics for user_id: ${userId}`);

  try {
    let { data, error } = await (dbClient as any)
      .from('company_monthly_metrics')
      .insert(payload)
      .select('id')
      .single();

    // If error occurs due to reality_check columns missing in older DB schema, retry without them
    if (error && (error.message?.includes('reality_check') || error.details?.includes('reality_check'))) {
      console.warn(`[Supabase Persistence] reality_check column not yet present in schema, retrying without top-level columns...`);
      const safePayload = { ...payload };
      delete safePayload.reality_check_question;
      delete safePayload.reality_check_description;
      delete safePayload.reality_check_category;
      const retryResult = await (dbClient as any)
        .from('company_monthly_metrics')
        .insert(safePayload)
        .select('id')
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    // If initial insert fails and service role client is available, retry with service role
    if (error && supabaseServer && dbClient !== supabaseServer) {
      console.warn(`[Supabase Persistence] User client insert failed (${error.message}). Retrying with supabaseServer...`);
      const retryResult = await (supabaseServer as any)
        .from('company_monthly_metrics')
        .insert(payload)
        .select('id')
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (!error && data?.id) {
      console.log(`[Supabase Persistence] Successfully saved record into company_monthly_metrics (ID: ${data.id})`);
      return { success: true, id: data.id, table: 'company_monthly_metrics' };
    }

    if (error) {
      console.error('[Supabase Persistence] Database insertion error for company_monthly_metrics:', error.message);

      // Handle table not yet in schema cache (PGRST205) by persisting to metrics table fallback
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.warn('[Supabase Persistence] company_monthly_metrics table not found in schema cache. Falling back to metrics table.');
        const targetClient = supabaseServer || dbClient;
        const fallbackPayload = {
          workspace_id: workspaceId || FIXED_WORKSPACE_ID,
          month: reportingMonth.split(' ')[0] || 'Current',
          arr: payload.arr,
          churn_rate: payload.churn_rate,
          ltv: payload.ltv,
          burn_rate: payload.burn_rate,
          team_burnout_index: payload.burnout_score,
          customer_trust_score: payload.trust_score,
          founder_cognitive_load: payload.cognitive_load_score,
          retention_sentiment: payload.retention_score,
        };

        const { data: mData, error: mError } = await (targetClient as any)
          .from('metrics')
          .insert(fallbackPayload)
          .select('id')
          .single();

        if (!mError && mData?.id) {
          console.log(`[Supabase Persistence] Successfully saved fallback record to "metrics" table (ID: ${mData.id})`);
          return { success: true, id: mData.id, table: 'metrics' };
        } else if (mError) {
          console.error('[Supabase Persistence] Metrics table fallback insertion failed:', mError.message);
          return { success: false, error: mError.message };
        }
      }

      return { success: false, error: error.message };
    }
  } catch (err: any) {
    console.error('[Supabase Persistence] Unexpected exception during metrics insertion:', err?.message || err);
    return { success: false, error: err?.message || 'Database insertion error' };
  }

  return { success: false, error: 'Database insertion failed' };
}

/**
 * Fetches the user's most recent saved metrics row (ordered by created_at DESC, limit 1)
 * from company_monthly_metrics, with fallback to the metrics table.
 */
export async function fetchLatestCompanyBaselineMetrics({
  client,
  userId,
  workspaceId = FIXED_WORKSPACE_ID,
}: {
  client?: any;
  userId?: string;
  workspaceId?: string;
}): Promise<CompanyBaselineMetrics | null> {
  const dbClient = client || supabaseServer;
  if (!dbClient) return null;

  try {
    // 1. Query company_monthly_metrics table ordered by created_at DESC, limit 1
    let query = (dbClient as any)
      .from('company_monthly_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
      query = query.eq('user_id', userId);
    }

    let { data: cmmData, error: cmmError } = await query;

    // If query with user_id had no rows, try without user_id filter (handles shared/dev workspace rows)
    if ((!cmmData || cmmData.length === 0) && !cmmError && userId && userId !== '00000000-0000-0000-0000-000000000000') {
      const fallbackQuery = await (dbClient as any)
        .from('company_monthly_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!fallbackQuery.error && fallbackQuery.data && fallbackQuery.data.length > 0) {
        cmmData = fallbackQuery.data;
        cmmError = null;
      }
    }

    if (!cmmError && cmmData && cmmData.length > 0) {
      const row = cmmData[0];
      console.log(`[Baseline Telemetry] Retrieved latest company_monthly_metrics (ID: ${row.id}, Month: ${row.reporting_month})`);
      const burnout = Number(row.burnout_score ?? row.burnout_index ?? 50);
      const burn = Number(row.monthly_burn ?? row.burn_rate ?? 0);
      const arr = Number(row.arr ?? 0);
      const churn = Number(row.churn_rate ?? row.monthly_churn_rate ?? 0);
      const clv = Number(row.clv ?? row.ltv ?? 0);
      const runway = row.runway_months != null ? Number(row.runway_months) : (burn > 0 && row.cash_in_bank ? Number((row.cash_in_bank / burn).toFixed(1)) : null);
      const trust = Number(row.trust_score ?? row.customer_trust_score ?? 75);
      const cognitive = Number(row.cognitive_load_score ?? row.founder_cognitive_load ?? 60);
      const retention = Number(row.retention_sentiment_score ?? row.retention_score ?? row.retention_sentiment ?? 70);
      const humanSubscore = Number(row.human_centric_subscore ?? Math.round((burnout + trust + cognitive + retention) / 4));

      // Normalization calculations for 50/50 Growth & Human dimensions
      const normHelper = (val: number, min: number, max: number, invert: boolean = false) => {
        if (min === max) return 50;
        const clamped = Math.max(min, Math.min(max, val));
        const ratio = (clamped - min) / (max - min);
        const score = invert ? (1 - ratio) * 100 : ratio * 100;
        return Math.round(score * 10) / 10;
      };

      const norm_arr = normHelper(arr, 0, 3000000, false);
      const norm_churn = normHelper(churn, 1, 15, true);
      const norm_ltv = normHelper(clv, 1000, 50000, false);
      const norm_burn = normHelper(burn, 10000, 200000, true);
      const growth_score_normalized = Math.round(norm_arr * 0.3 + norm_churn * 0.3 + norm_ltv * 0.2 + norm_burn * 0.2);

      const norm_burnout = normHelper(burnout, 0, 100, true);
      const norm_trust = normHelper(trust, 0, 100, false);
      const norm_cognitive = normHelper(cognitive, 0, 100, true);
      const norm_retention = normHelper(retention, 0, 100, false);
      const human_score_normalized = Math.round(humanSubscore || ((norm_burnout + norm_trust + norm_cognitive + norm_retention) / 4));

      const composite_health_score = Math.round((growth_score_normalized + human_score_normalized) / 2);

      return {
        id: row.id,
        sourceTable: 'company_monthly_metrics',
        company_name: row.company_name || 'FounderSync Venture',
        reporting_month: row.reporting_month || 'Current Period',
        arr,
        mrr: Number(row.mrr ?? (arr ? Math.round(arr / 12) : 0)),
        burn_rate: burn,
        burnRate: burn,
        monthly_burn: burn,
        monthlyBurn: burn,
        runway_months: runway,
        runwayMonths: runway,
        churn_rate: churn,
        churnRate: churn,
        monthly_churn_rate: churn,
        ltv: clv,
        clv,
        burnout_score: burnout,
        burnout_index: burnout,
        burnoutIndex: burnout,
        burnout_score_band: row.burnout_score_band || (burnout >= 67 ? 'high' : burnout >= 34 ? 'moderate' : 'low'),
        trust_score: trust,
        customer_trust_score: trust,
        customerTrustScore: trust,
        cognitive_load_score: cognitive,
        founder_cognitive_load: cognitive,
        founderCognitiveLoad: cognitive,
        retention_score: retention,
        retention_sentiment: retention,
        retention_sentiment_score: retention,
        retentionSentiment: retention,
        human_centric_subscore: humanSubscore,
        humanCentricScore: humanSubscore,
        growth_score_normalized,
        human_score_normalized,
        composite_health_score,
        startup_health_score: composite_health_score,
        reality_check_question:
          row.reality_check_question ||
          row.calculated_metrics?.reality_check_question ||
          row.calculated_metrics?.realityCheckQuestion ||
          (burnout >= 60 || burn >= 60000
            ? `“Are you accelerating monthly burn of $${Math.round(burn).toLocaleString()} to buy growth when retention sentiment has dropped to ${retention}/100?”`
            : '“Are you scaling outbound spend because gross retention supports it, or to mask an emerging team bandwidth bottleneck?”'),
        realityCheckQuestion:
          row.reality_check_question ||
          row.calculated_metrics?.reality_check_question ||
          row.calculated_metrics?.realityCheckQuestion ||
          (burnout >= 60 || burn >= 60000
            ? `“Are you accelerating monthly burn of $${Math.round(burn).toLocaleString()} to buy growth when retention sentiment has dropped to ${retention}/100?”`
            : '“Are you scaling outbound spend because gross retention supports it, or to mask an emerging team bandwidth bottleneck?”'),
        reality_check_description:
          row.reality_check_description ||
          row.calculated_metrics?.reality_check_description ||
          row.calculated_metrics?.realityCheckDescription ||
          `With ${runway ? `${runway} months` : 'limited'} runway remaining and customer churn at ${churn}%, aggressive spending risks compounding net loss before product-market retention stabilizes.`,
        realityCheckDescription:
          row.reality_check_description ||
          row.calculated_metrics?.reality_check_description ||
          row.calculated_metrics?.realityCheckDescription ||
          `With ${runway ? `${runway} months` : 'limited'} runway remaining and customer churn at ${churn}%, aggressive spending risks compounding net loss before product-market retention stabilizes.`,
        reality_check_category:
          row.reality_check_category ||
          row.calculated_metrics?.reality_check_category ||
          row.calculated_metrics?.realityCheckCategory ||
          'CONTRADICTION',
        realityCheckCategory:
          row.reality_check_category ||
          row.calculated_metrics?.reality_check_category ||
          row.calculated_metrics?.realityCheckCategory ||
          'CONTRADICTION',
        norm_arr,
        norm_churn,
        norm_ltv,
        norm_burn,
        norm_burnout,
        norm_trust,
        norm_cognitive,
        norm_retention,
        created_at: row.created_at,
      };
    }

    if (cmmError) {
      console.warn('[Baseline Telemetry] company_monthly_metrics query notice:', cmmError.message);
    }

    // 2. Fallback to metrics table
    const { data: mData, error: mError } = await (dbClient as any)
      .from('metrics')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!mError && mData && mData.length > 0) {
      const row = mData[0];
      console.log(`[Baseline Telemetry] Loaded baseline from metrics table (ID: ${row.id}, Month: ${row.month})`);
      const arr = Number(row.arr) || 1200000;
      const burn = Number(row.burn_rate) || 85000;
      const burnout = Number(row.team_burnout_index) || 52;
      const churn = Number(row.churn_rate) || 4.2;
      const ltv = Number(row.ltv) || 21000;
      const trust = Number(row.customer_trust_score) || 80;
      const cognitive = Number(row.founder_cognitive_load) || 65;
      const retention = Number(row.retention_sentiment) || 70;
      const humanSubscore = Math.round((burnout + trust + cognitive + retention) / 4);

      return {
        id: row.id,
        sourceTable: 'metrics',
        company_name: 'FounderSync Venture',
        reporting_month: row.month || 'Recent Period',
        arr,
        mrr: Math.round(arr / 12),
        burn_rate: burn,
        burnRate: burn,
        monthly_burn: burn,
        monthlyBurn: burn,
        runway_months: burn > 0 ? Math.round((arr / 2) / burn) : 18,
        runwayMonths: burn > 0 ? Math.round((arr / 2) / burn) : 18,
        churn_rate: churn,
        churnRate: churn,
        monthly_churn_rate: churn,
        ltv,
        clv: ltv,
        burnout_score: burnout,
        burnout_index: burnout,
        burnoutIndex: burnout,
        burnout_score_band: burnout >= 67 ? 'high' : burnout >= 34 ? 'moderate' : 'low',
        trust_score: trust,
        customer_trust_score: trust,
        customerTrustScore: trust,
        cognitive_load_score: cognitive,
        founder_cognitive_load: cognitive,
        founderCognitiveLoad: cognitive,
        retention_score: retention,
        retention_sentiment: retention,
        retention_sentiment_score: retention,
        retentionSentiment: retention,
        human_centric_subscore: humanSubscore,
        humanCentricScore: humanSubscore,
        growth_score_normalized: Math.round(
          ((Math.min(3000000, Math.max(0, arr)) / 3000000) * 100) * 0.3 +
          ((1 - (Math.min(15, Math.max(1, churn)) - 1) / 14) * 100) * 0.3 +
          (((Math.min(50000, Math.max(1000, ltv)) - 1000) / 49000) * 100) * 0.2 +
          ((1 - (Math.min(200000, Math.max(10000, burn)) - 10000) / 190000) * 100) * 0.2
        ),
        human_score_normalized: humanSubscore,
        composite_health_score: Math.round(
          (Math.round(
            ((Math.min(3000000, Math.max(0, arr)) / 3000000) * 100) * 0.3 +
            ((1 - (Math.min(15, Math.max(1, churn)) - 1) / 14) * 100) * 0.3 +
            (((Math.min(50000, Math.max(1000, ltv)) - 1000) / 49000) * 100) * 0.2 +
            ((1 - (Math.min(200000, Math.max(10000, burn)) - 10000) / 190000) * 100) * 0.2
          ) + humanSubscore) / 2
        ),
        startup_health_score: Math.round(
          (Math.round(
            ((Math.min(3000000, Math.max(0, arr)) / 3000000) * 100) * 0.3 +
            ((1 - (Math.min(15, Math.max(1, churn)) - 1) / 14) * 100) * 0.3 +
            (((Math.min(50000, Math.max(1000, ltv)) - 1000) / 49000) * 100) * 0.2 +
            ((1 - (Math.min(200000, Math.max(10000, burn)) - 10000) / 190000) * 100) * 0.2
          ) + humanSubscore) / 2
        ),
        reality_check_question:
          burnout >= 60 || burn >= 60000
            ? `“Are you accelerating monthly burn of $${Math.round(burn).toLocaleString()} to buy growth when retention sentiment has dropped to ${retention}/100?”`
            : '“Are you scaling outbound spend because gross retention supports it, or to mask an emerging team bandwidth bottleneck?”',
        realityCheckQuestion:
          burnout >= 60 || burn >= 60000
            ? `“Are you accelerating monthly burn of $${Math.round(burn).toLocaleString()} to buy growth when retention sentiment has dropped to ${retention}/100?”`
            : '“Are you scaling outbound spend because gross retention supports it, or to mask an emerging team bandwidth bottleneck?”',
        reality_check_description: `With ${burn > 0 ? `${Math.round((arr / 2) / burn)} months` : 'healthy'} runway buffer and customer churn at ${churn}%, strategic resource allocation must align with human sustainability.`,
        realityCheckDescription: `With ${burn > 0 ? `${Math.round((arr / 2) / burn)} months` : 'healthy'} runway buffer and customer churn at ${churn}%, strategic resource allocation must align with human sustainability.`,
        reality_check_category: 'CONTRADICTION',
        realityCheckCategory: 'CONTRADICTION',
        norm_arr: Math.round(((Math.min(3000000, Math.max(0, arr)) / 3000000) * 100) * 10) / 10,
        norm_churn: Math.round(((1 - (Math.min(15, Math.max(1, churn)) - 1) / 14) * 100) * 10) / 10,
        norm_ltv: Math.round((((Math.min(50000, Math.max(1000, ltv)) - 1000) / 49000) * 100) * 10) / 10,
        norm_burn: Math.round(((1 - (Math.min(200000, Math.max(10000, burn)) - 10000) / 190000) * 100) * 10) / 10,
        norm_burnout: Math.round((100 - burnout) * 10) / 10,
        norm_trust: trust,
        norm_cognitive: Math.round((100 - cognitive) * 10) / 10,
        norm_retention: retention,
        created_at: row.created_at,
      };
    }
  } catch (err: any) {
    console.error('[Baseline Telemetry] Error retrieving baseline metrics:', err?.message || err);
  }

  return null;
}

