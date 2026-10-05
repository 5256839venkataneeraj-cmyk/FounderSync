import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSecurityHeaders } from '@/lib/security';

export const runtime = 'nodejs';

const ConciergeInquirySchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Valid work email is required'),
  countryCode: z.string().trim().min(1).max(6).default('+1'),
  phone: z.string().trim().min(5, 'Valid phone number is required').max(30),
  message: z.string().trim().min(10, 'Inquiry message must be at least 10 characters').max(4000),
  priority: z.enum(['routine', 'strategic-urgent', 'board-prep', 'critical']).default('strategic-urgent'),
});

export async function POST(req: NextRequest) {
  // 1. Enforce IP rate limiting
  const rateLimitResponse = checkRateLimit(req, { limit: 15, windowMs: 60 * 1000 });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await req.json();
    const validated = ConciergeInquirySchema.safeParse(rawBody);

    if (!validated.success) {
      const errorMsg = validated.error.issues[0]?.message || 'Invalid inquiry payload.';
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const { firstName, lastName, email, countryCode, phone, message, priority } = validated.data;
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const receivedAt = new Date().toISOString();

    // Log securely to sovereign console
    console.log(`[Concierge Sovereign Enclave] Received inquiry #${inquiryId} from ${firstName} ${lastName} (${email}) - Priority: ${priority}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          inquiryId,
          receivedAt,
          status: 'dispatched_to_advisory_unit',
          sla: 'Priority turnaround: < 2 hours',
          founder: `${firstName} ${lastName}`,
          directContact: {
            conciergeEmail: 'potluri.venkata2026@vitstudent.ac.in',
            directPhone: '+91 8618331467',
            jurisdiction: 'Bangalore, India',
          },
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (err: any) {
    console.error('[Concierge API] Internal Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing concierge dispatch.' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
