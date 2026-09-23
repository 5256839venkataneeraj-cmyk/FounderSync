import { NextRequest, NextResponse } from 'next/server';
import { ingestMetricsDocument } from '@/lib/metricsIngestion';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSecurityHeaders } from '@/lib/security';

export const runtime = 'nodejs';

function methodNotAllowed(method: string): NextResponse {
  return NextResponse.json(
    {
      status: 'incomplete',
      error: `Method ${method} not allowed. This endpoint accepts POST only.`,
    },
    {
      status: 405,
      headers: { Allow: 'POST', ...getSecurityHeaders() },
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

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check (30 requests per minute per IP / User)
  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000 });
  if (rateLimitError) {
    return rateLimitError;
  }

  try {
    let documentText = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => null);
      if (typeof body === 'string') {
        documentText = body;
      } else if (body && typeof body === 'object') {
        documentText =
          body.text ||
          body.document ||
          body.raw ||
          body.content ||
          body.documentText ||
          body.intake_form ||
          '';
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        const textParam = formData.get('text') || formData.get('document');
        if (typeof textParam === 'string') {
          documentText = textParam;
        } else {
          const fileParam = formData.get('file');
          if (fileParam && typeof (fileParam as any).text === 'function') {
            documentText = await (fileParam as any).text();
          }
        }
      }
    } else {
      // Raw plain text or octet stream
      documentText = await req.text().catch(() => '');
    }

    // 2. Execute strict Phase 1 extraction and Phase 2 calculation contract
    const result = ingestMetricsDocument(documentText);

    // 3. Output strictly conforming to the contract
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(),
      },
    });
  } catch (error: any) {
    // In case of unexpected parsing errors, gracefully return incomplete status
    return NextResponse.json(
      {
        status: 'incomplete',
        missing_fields: [
          'company_name',
          'reporting_month',
          'mrr',
          'total_active_customers',
          'monthly_revenue',
          'customers_lost',
          'starting_customers',
          'avg_revenue_per_customer',
          'monthly_expenses',
          'cash_in_bank',
          'burnout_answers',
          'trust_answers',
          'cognitive_load_answers',
          'retention_answers',
        ],
        extracted: {
          company_name: null,
          reporting_month: null,
          mrr: null,
          total_active_customers: null,
          monthly_revenue: null,
          customers_lost: null,
          starting_customers: null,
          avg_revenue_per_customer: null,
          monthly_expenses: null,
          cash_in_bank: null,
          burnout_answers: null,
          trust_answers: null,
          cognitive_load_answers: null,
          retention_answers: null,
        },
        calculated: {},
      },
      {
        status: 200,
        headers: getSecurityHeaders(),
      }
    );
  }
}
