import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runRealityCheckWithGrok } from '@/lib/grok';
import { fetchServerWorkspaceMetrics, persistRealityCheck } from '@/lib/supabase-server';
import { INITIAL_GROWTH_METRICS, INITIAL_HUMAN_METRICS } from '@/lib/mockData';
import { ApiErrorResponse, ApiResponse, RealityCheckResult } from '@/lib/types';
import { safeLogger, verifySession } from '@/lib/security';

export const runtime = 'nodejs';

const RealityCheckRequestSchema = z.object({
  strategy: z.string({ message: 'Strategy is required.' }).min(10, 'Strategy must be at least 10 characters long.'),
  apiKey: z.string().optional(),
});

/**
 * Rejection handler for non-POST HTTP methods
 */
function methodNotAllowed(method: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `Method ${method} not allowed. This endpoint accepts POST only.`,
    },
    {
      status: 405,
      headers: { Allow: 'POST' },
    }
  );
}

export async function GET(req: NextRequest) {
  return methodNotAllowed('GET');
}

export async function PUT(req: NextRequest) {
  return methodNotAllowed('PUT');
}

export async function DELETE(req: NextRequest) {
  return methodNotAllowed('DELETE');
}

export async function PATCH(req: NextRequest) {
  return methodNotAllowed('PATCH');
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<RealityCheckResult>>> {
  try {
    // 1. Enforce Authenticated Session
    const auth = verifySession(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error || 'Unauthorized: Missing or invalid authenticated session credentials.',
        },
        { status: 401 }
      );
    }

    // 2. Validate Request Body with Zod
    let rawBody: unknown;
    const text = await req.text();
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body cannot be empty.',
          details: { strategy: ['Strategy is required.'] },
        },
        { status: 400 }
      );
    }

    try {
      rawBody = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON payload in request body.',
        },
        { status: 400 }
      );
    }

    const parseResult = RealityCheckRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for reality check request.',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { strategy, apiKey } = parseResult.data;

    // 3. Fetch current workspace metrics for operating context
    const serverMetrics = await fetchServerWorkspaceMetrics(auth.workspaceId);
    const growthMetrics = serverMetrics?.growthMetrics || INITIAL_GROWTH_METRICS;
    const humanMetrics = serverMetrics?.humanMetrics || INITIAL_HUMAN_METRICS;

    // 4. Run Grok Contradictory Advisor (safe fallback to mock on timeout or failure)
    const realityCheckResult = await runRealityCheckWithGrok(
      strategy,
      { ...growthMetrics, ...humanMetrics },
      apiKey
    );

    // 5. Persist to Supabase reality_checks table
    let realityCheckId: string | undefined = undefined;
    try {
      const insertedId = await persistRealityCheck(realityCheckResult, auth.workspaceId);
      if (insertedId) {
        realityCheckId = insertedId;
      }
    } catch (dbErr: any) {
      safeLogger.error('[API Reality-Check] Failed to persist reality check:', dbErr);
    }

    // 6. Return standard success envelope with realityCheckId
    return NextResponse.json(
      {
        success: true,
        data: realityCheckResult,
        realityCheckId,
      },
      { status: 200 }
    );
  } catch (err: any) {
    safeLogger.error('[API Reality-Check] Unhandled internal server error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing reality check.',
      },
      { status: 500 }
    );
  }
}
