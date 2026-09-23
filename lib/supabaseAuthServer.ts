import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { FIXED_WORKSPACE_ID } from '@/lib/types';
import { safeLogger } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export interface AuthValidationResult {
  client: SupabaseClient | null;
  user: User | null;
  userId: string;
  workspaceId: string;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Extracts and cryptographically verifies the caller's authenticated session.
 * Rejects unauthenticated requests and provides an authenticated Supabase client.
 */
export async function getAuthenticatedSupabaseClient(
  req: NextRequest
): Promise<AuthValidationResult> {
  const workspaceId = process.env.WORKSPACE_ID || FIXED_WORKSPACE_ID;

  // 1. Extract Bearer token from Authorization header or Supabase session cookies
  let token = '';
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    const cookies = req.cookies;
    token =
      cookies.get('sb-access-token')?.value ||
      cookies.get('supabase-auth-token')?.value ||
      Array.from(cookies.getAll()).find((c) => c.name.endsWith('-auth-token'))?.value ||
      '';
  }

  // 2. If token is present, cryptographically verify it with Supabase Auth
  if (token && supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey)) {
    try {
      const verifierClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: { user }, error } = await verifierClient.auth.getUser(token);

      if (!error && user) {
        // Authenticated client bound to the verified user's token
        const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

        return {
          client: authenticatedClient,
          user,
          userId: user.id,
          workspaceId,
          isAuthenticated: true,
          error: null,
        };
      }
    } catch (err) {
      safeLogger.warn('[Auth Server] Cryptographic token verification failed:', err);
    }
  }

  // 3. Development / Localhost single-tenant fallback mode
  // Allows testing when running locally without active Supabase Auth credentials
  const isDev = process.env.NODE_ENV === 'development';
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const referer = req.headers.get('referer');
  const hasInternalOrigin =
    (origin && host && origin.includes(host)) ||
    (referer && host && referer.includes(host));

  const sessionHeader = req.headers.get('x-session-token') || req.headers.get('x-user-session');

  if (isDev && (hasInternalOrigin || sessionHeader === 'dev-founder-session')) {
    // Return dev workspace client
    const fallbackClient =
      supabaseUrl && supabaseServiceRoleKey
        ? createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;

    return {
      client: fallbackClient,
      user: { id: '00000000-0000-0000-0000-000000000000', email: 'founder@foundersync.dev' } as User,
      userId: '00000000-0000-0000-0000-000000000000',
      workspaceId,
      isAuthenticated: true,
      error: null,
    };
  }

  // Unauthorized
  return {
    client: null,
    user: null,
    userId: '',
    workspaceId,
    isAuthenticated: false,
    error: 'Unauthorized: Missing or invalid authentication session credentials.',
  };
}
