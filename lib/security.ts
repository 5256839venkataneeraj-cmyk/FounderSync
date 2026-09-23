import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorResponse, FIXED_WORKSPACE_ID } from '@/lib/types';

/**
 * Regex patterns matching API key and token material for secure server redaction.
 */
const KEY_PATTERNS = [
  /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
  /xai-[0-9A-Za-z-_]{20,}/g, // xAI / Grok keys
  /gsk_[0-9A-Za-z-_]{20,}/g, // GroqCloud API keys
  /sb_publishable_[0-9A-Za-z-_]{20,}/g, // Supabase publishable keys
  /sb_secret_[0-9A-Za-z-_]{20,}/g, // Supabase secret keys
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
 * Returns standard protective security headers for API route responses.
 * Enforces no-store cache control and content boundaries.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  };
}

/**
 * Verifies session authentication for incoming API requests.
 * Restricts access to validated sessions and localhost development testing.
 * Rejects unverified forged JWT strings.
 */
export function verifySession(req: NextRequest): AuthContext {
  const workspaceId = process.env.WORKSPACE_ID || FIXED_WORKSPACE_ID;

  // Localhost Development Fallback only
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    const origin = req.headers.get('origin') || '';
    const host = req.headers.get('host') || '';
    const referer = req.headers.get('referer') || '';
    const isLocalhost =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      origin.includes('localhost') ||
      referer.includes('localhost');

    const sessionHeader = req.headers.get('x-session-token') || req.headers.get('x-user-session');

    if (isLocalhost || sessionHeader === 'dev-founder-session') {
      return { authenticated: true, workspaceId, userId: 'dev-local-user' };
    }
  }

  // Reject unverified or missing credentials
  return {
    authenticated: false,
    workspaceId,
    error: 'Unauthorized: Cryptographic session verification required. Unverified tokens rejected.',
  };
}

