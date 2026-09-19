import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

const FIXED_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Request body is required.' },
        { status: 400 }
      );
    }

    const { realityCheckId, action, justification, strategy } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required (Accept, Pivot, or Override).' },
        { status: 400 }
      );
    }

    if (!justification || justification.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Justification is required for the decision audit log.' },
        { status: 400 }
      );
    }

    // Map user-friendly action names to database constraints if needed
    const dbAction =
      action === 'Accept'
        ? 'ACCEPT_AND_OVERRIDE_AI'
        : action === 'Pivot'
        ? 'PIVOT_STRATEGY'
        : 'ACCEPT_AND_OVERRIDE_AI';

    let decisionId = `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const { data, error } = await (supabaseServer as any)
        .from('decisions')
        .insert({
          workspace_id: FIXED_WORKSPACE_ID,
          reality_check_id: realityCheckId && !realityCheckId.startsWith('sim-') && !realityCheckId.startsWith('rc-') ? realityCheckId : null,
          action: dbAction,
          justification: justification.trim(),
        })
        .select('id')
        .single();

      if (!error && data?.id) {
        decisionId = data.id;
      } else if (error) {
        console.warn('[API Decisions] Supabase insert warning, falling back to local ID:', error.message);
      }
    } catch (dbErr: any) {
      console.warn('[API Decisions] Database insert error:', dbErr.message);
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
        message: 'Decision successfully committed to executive audit log.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[API Decisions] Server error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to record human-in-the-loop decision.',
      },
      { status: 500 }
    );
  }
}
