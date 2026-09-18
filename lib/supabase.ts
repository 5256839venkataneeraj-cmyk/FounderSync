import { createClient } from '@supabase/supabase-js';
import { FIXED_WORKSPACE_ID, Metric, Decision, HeatmapScore, StrategicAnalysisResult } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Checks if Supabase client-side credentials are configured in the environment.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key'
  );
};

/**
 * Client-side Supabase instance.
 * Scoped to anonymous public access with RLS policies.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Data Access Helpers for Client Components (scoped to FIXED_WORKSPACE_ID)
 */
export async function fetchWorkspaceMetrics(): Promise<Metric[] | null> {
  if (!supabase) return null;
  const { data, error } = await (supabase as any)
    .from('metrics')
    .select('*')
    .eq('workspace_id', FIXED_WORKSPACE_ID)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[Supabase] Failed to fetch metrics:', error.message);
    return null;
  }
  return data as Metric[];
}

export async function fetchWorkspaceDecisions(): Promise<Decision[] | null> {
  if (!supabase) return null;
  const { data, error } = await (supabase as any)
    .from('decisions')
    .select('*, reality_checks(*)')
    .eq('workspace_id', FIXED_WORKSPACE_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] Failed to fetch decisions joined with reality_checks:', error.message);
    return null;
  }
  return data as Decision[];
}

export async function fetchWorkspaceHeatmap(): Promise<any | null> {
  if (!supabase) return null;
  const { data, error } = await (supabase as any)
    .from('heatmap_scores')
    .select('*')
    .eq('workspace_id', FIXED_WORKSPACE_ID)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Failed to fetch heatmap scores:', error.message);
    return null;
  }
  return data;
}

export async function fetchLatestStrategicAnalysis(): Promise<any | null> {
  if (!supabase) return null;
  const { data, error } = await (supabase as any)
    .from('strategic_analyses')
    .select('*')
    .eq('workspace_id', FIXED_WORKSPACE_ID)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Failed to fetch strategic analysis:', error.message);
    return null;
  }
  return data;
}
