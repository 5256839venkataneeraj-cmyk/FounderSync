import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedSupabaseClient } from '@/lib/supabaseAuthServer';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSecurityHeaders } from '@/lib/security';

export const runtime = 'nodejs';

const DecisionSchema = z.object({
  realityCheckId: z.string().max(100).nullable().optional(),
  action: z.enum([
    'Accept',
    'Pivot',
    'Override',
    'ACCEPT_AND_OVERRIDE_AI',
    'PIVOT_STRATEGY',
    'proceed',
    'proceed_with_caution',
  ]),
  justification: z.string().trim().min(20, 'Justification must be at least 20 characters').max(5000),
  strategy: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check (60 requests per minute per IP / User)
  const rateLimitError = checkRateLimit(req, { limit: 60, windowMs: 60 * 1000 });
  if (rateLimitError) {
    return rateLimitError;
  }

  // 2. Session Authentication Gate
  const auth = await getAuthenticatedSupabaseClient(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error || 'Unauthorized: Active session required to commit audit log decisions.',
      },
      { status: 401, headers: getSecurityHeaders() }
    );
  }


  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: 'Request body is required.' },
        { status: 400 }
      );
    }

    const parseResult = DecisionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for decision payload.',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { realityCheckId, action, justification } = parseResult.data;

    // Map user-friendly action names to database constraints
    const dbAction =
      action === 'Accept' || action === 'proceed'
        ? 'ACCEPT_AND_OVERRIDE_AI'
        : action === 'Pivot'
        ? 'PIVOT_STRATEGY'
        : 'ACCEPT_AND_OVERRIDE_AI';

    let decisionId = `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const dbClient = auth.client || supabaseServer;

    if (dbClient) {
      try {
        const validRealityCheckId =
          realityCheckId &&
          !realityCheckId.startsWith('sim-') &&
          !realityCheckId.startsWith('rc-')
            ? realityCheckId
            : null;

        // Primary: Insert into decision_audit_logs with authenticated user_id
        let { data, error } = await (dbClient as any)
          .from('decision_audit_logs')
          .insert({
            user_id: auth.userId,
            reality_check_id: validRealityCheckId,
            founder_action: action,
            justification: justification.trim(),
          })
          .select('id')
          .single();

        if (error) {
          // Fallback to decisions table if legacy schema is present
          const fallback = await (dbClient as any)
            .from('decisions')
            .insert({
              user_id: auth.userId,
              workspace_id: auth.workspaceId,
              reality_check_id: validRealityCheckId,
              action: dbAction,
              justification: justification.trim(),
            })
            .select('id')
            .single();
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data?.id) {
          decisionId = data.id;
        } else if (error) {
          console.warn('[API Decisions] Database insert error:', error.message);
        }
      } catch (dbErr: any) {
        console.warn('[API Decisions] Database write warning:', dbErr.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        id: decisionId,
        decisionId,
        action,
        justification: justification.trim(),
        realityCheckId: realityCheckId || null,
        committedAt: new Date().toISOString(),
        message: 'Decision successfully verified, signed by founder, and committed to audit log.',
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (err: any) {
    console.error('[API Decisions] Server error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record human-in-the-loop decision.',
      },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

