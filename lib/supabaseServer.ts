import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Validates that server-side Supabase credentials exist and are not placeholder values.
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
 * Server-side Supabase client initialized with elevated service role key.
 * Bypasses Row Level Security (RLS) for backend operations, webhooks, and secure server actions.
 * Safely evaluates to null if not configured to prevent unhandled process crashes.
 * WARNING: Never import this client in client-side code!
 */
export const supabaseServer: SupabaseClient | null = isSupabaseServerConfigured()
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export default supabaseServer;
