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
