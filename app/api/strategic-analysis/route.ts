import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeStrategyWithGemini } from '@/lib/gemini';
import { fetchServerWorkspaceMetrics, persistStrategicAnalysis } from '@/lib/supabase-server';
import { INITIAL_GROWTH_METRICS, INITIAL_HUMAN_METRICS, INITIAL_TIME_SERIES } from '@/lib/mockData';
import { ApiErrorResponse, ApiResponse, StrategicAnalysisResult } from '@/lib/types';
import { safeLogger, verifySession } from '@/lib/security';

export const runtime = 'nodejs';

const StrategicAnalysisRequestSchema = z.object({
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

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<StrategicAnalysisResult>>> {
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
    let rawBody: unknown = {};
    const text = await req.text();
    if (text && text.trim().length > 0) {
      try {
        rawBody = JSON.parse(text);
      } catch (err) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON payload in request body.',
          },
          { status: 400 }
        );
      }
    }

    const parseResult = StrategicAnalysisRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for strategic analysis request.',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { apiKey } = parseResult.data;

    // 3. Fetch current workspace metrics (or fallback to seeded mock baseline)
    const serverMetrics = await fetchServerWorkspaceMetrics(auth.workspaceId);
    const growthMetrics = serverMetrics?.growthMetrics || INITIAL_GROWTH_METRICS;
    const humanMetrics = serverMetrics?.humanMetrics || INITIAL_HUMAN_METRICS;
    const timeSeries = serverMetrics?.timeSeries || INITIAL_TIME_SERIES;

    // 4. Run Strategic Mirror & Analyst via Gemini (safe fallback to mock on timeout or failure)
    const analysisResult = await analyzeStrategyWithGemini(
      { ...growthMetrics, ...humanMetrics },
      timeSeries,
      apiKey
    );

    // 5. Persist to Supabase strategic_analyses table
    let persisted = false;
    try {
      const insertedId = await persistStrategicAnalysis(analysisResult, auth.workspaceId);
      persisted = Boolean(insertedId);
    } catch (dbErr: any) {
      safeLogger.error('[API Strategic-Analysis] Failed to persist analysis:', dbErr);
      persisted = false;
    }

    // 6. Return standard success envelope
    return NextResponse.json(
      {
        success: true,
        data: analysisResult,
        persisted,
      },
      { status: 200 }
    );
  } catch (err: any) {
    safeLogger.error('[API Strategic-Analysis] Unhandled internal server error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing strategic analysis.',
      },
      { status: 500 }
    );
  }
}
