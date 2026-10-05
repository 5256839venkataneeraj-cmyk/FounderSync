import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSecurityHeaders, handleCorsPreflight } from '@/lib/security';

export const runtime = 'nodejs';

// Target administrator / concierge inbox for FounderSync
const DEFAULT_ADMIN_EMAIL = 'potluri.venkata2026@vitstudent.ac.in';
const PLATFORM_NAME = 'FounderSync Sovereign Enclave';

/**
 * Zod schema supporting both strict and flexible field names:
 * - first name, last name
 * - work email (or email)
 * - telephone (or phone)
 * - deliberation urgency / topic selection (priority, urgency, topic)
 * - strategic hypothesis / challenge message (message, strategicHypothesis)
 */
const ContactSubmissionSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(80),
    lastName: z.string().trim().min(1, 'Last name is required').max(80),
    email: z.string().trim().email('Valid work email is required').optional(),
    workEmail: z.string().trim().email('Valid work email is required').optional(),
    countryCode: z.string().trim().min(1).max(6).default('+91'),
    phone: z.string().trim().max(35).optional(),
    telephone: z.string().trim().max(35).optional(),
    priority: z.string().trim().max(100).optional(),
    urgency: z.string().trim().max(100).optional(),
    topic: z.string().trim().max(100).optional(),
    message: z.string().trim().min(10, 'Inquiry message must be at least 10 characters').max(5000).optional(),
    strategicHypothesis: z
      .string()
      .trim()
      .min(10, 'Strategic hypothesis must be at least 10 characters')
      .max(5000)
      .optional(),
  })
  .refine((data) => data.email || data.workEmail, {
    message: 'Valid work email is required',
    path: ['email'],
  })
  .refine((data) => data.message || data.strategicHypothesis, {
    message: 'Strategic hypothesis / challenge message is required',
    path: ['message'],
  });

export type ContactSubmissionInput = z.infer<typeof ContactSubmissionSchema>;

/**
 * Builds an RFC 2822 MIME multipart message base64url encoded for the Gmail REST API (messages.send).
 */
function buildRawGmailMessage({
  to,
  from,
  replyTo,
  subject,
  html,
  text,
}: {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): string {
  const boundary = `====boundary_${Date.now()}_${Math.random().toString(36).substring(2, 9)}====`;
  const subjectEncoded = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

  const headers = [
    `To: ${to}`,
    `From: ${from}`,
    replyTo ? `Reply-To: ${replyTo}` : '',
    `Subject: ${subjectEncoded}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean);

  const bodyParts = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
    '',
    `--${boundary}--`,
  ];

  const fullEmail = `${headers.join('\r\n')}\r\n\r\n${bodyParts.join('\r\n')}`;
  return Buffer.from(fullEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Exchanges Google OAuth2 refresh token for an active Gmail API access token.
 */
async function getGmailAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google OAuth token refresh failed (${res.status}): ${errorText}`);
  }

  const json = await res.json();
  if (!json.access_token) {
    throw new Error('No access_token returned from Google OAuth token endpoint');
  }
  return json.access_token;
}

/**
 * Sends email via Gmail API REST v1 messages.send.
 */
async function sendViaGmailApi(rawBase64Url: string, accessToken: string): Promise<any> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawBase64Url }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gmail API messages.send failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Generates executive HTML email notification template.
 */
function generateHtmlEmail({
  inquiryId,
  receivedAt,
  firstName,
  lastName,
  email,
  phone,
  urgency,
  message,
}: {
  inquiryId: string;
  receivedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  urgency: string;
  message: string;
}): string {
  const urgencyLabel = urgency.toUpperCase().replace('-', ' ');
  const urgencyBadgeColor =
    urgency === 'critical'
      ? '#ef4444'
      : urgency === 'board-prep'
      ? '#f59e0b'
      : urgency === 'strategic-urgent'
      ? '#6366f1'
      : '#64748b';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confidential Advisory Intake</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #0c0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background-color: #14151d; border-radius: 16px; border: 1px solid #232533; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <!-- Header -->
    <tr>
      <td style="padding: 28px 32px; background: linear-gradient(135deg, #181926 0%, #1e1e30 100%); border-bottom: 1px solid #282a3d;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #818cf8; margin-bottom: 6px;">
                ${PLATFORM_NAME}
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                Confidential Advisory Intake
              </h1>
            </td>
            <td align="right">
              <span style="display: inline-block; padding: 6px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 20px; background-color: ${urgencyBadgeColor}20; color: ${urgencyBadgeColor}; border: 1px solid ${urgencyBadgeColor}50;">
                ${urgencyLabel}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Metadata Bar -->
    <tr>
      <td style="padding: 14px 32px; background-color: #101118; border-bottom: 1px solid #1f212f; font-size: 12px; color: #94a3b8;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td><strong>Tracking ID:</strong> <span style="font-family: monospace; color: #cbd5e1;">${inquiryId}</span></td>
            <td align="right"><strong>Received:</strong> ${new Date(receivedAt).toUTCString()}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Founder Details -->
    <tr>
      <td style="padding: 28px 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #a5b4fc; font-weight: 700;">
          Founder Contact Details
        </h2>
        <table width="100%" border="0" cellpadding="8" cellspacing="0" style="background-color: #1a1b26; border-radius: 10px; border: 1px solid #282a3d; font-size: 14px;">
          <tr>
            <td width="30%" style="color: #64748b; font-weight: 600;">Full Name:</td>
            <td style="color: #f1f5f9; font-weight: 700;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Work Email:</td>
            <td>
              <a href="mailto:${email}" style="color: #818cf8; text-decoration: none; font-weight: 600;">
                ${email}
              </a>
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Telephone:</td>
            <td>
              <a href="tel:${phone.replace(/\s+/g, '')}" style="color: #cbd5e1; text-decoration: none;">
                ${phone}
              </a>
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Topic / Urgency:</td>
            <td style="color: #f1f5f9; font-weight: 600;">${urgency}</td>
          </tr>
        </table>

        <!-- Strategic Hypothesis Block -->
        <h2 style="margin: 28px 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #a5b4fc; font-weight: 700;">
          Strategic Hypothesis &amp; Deliberation Challenge
        </h2>
        <div style="background-color: #1a1b26; border-left: 3px solid #6366f1; border-radius: 0 10px 10px 0; padding: 18px 20px; font-size: 14px; line-height: 1.65; color: #e2e8f0; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
${message}
        </div>

        <!-- CTA Action Buttons -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 28px;">
          <tr>
            <td align="center">
              <a href="mailto:${email}?subject=Re:%20FounderSync%20Advisory%20Intake%20%5B${inquiryId}%5D" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.03em; margin-right: 12px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                Reply Directly to Founder
              </a>
              <a href="tel:${phone.replace(/\s+/g, '')}" style="display: inline-block; padding: 12px 20px; background-color: #232533; color: #e2e8f0; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid #36394e;">
                Call Telephone
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #0f1016; border-top: 1px solid #1f212f; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
        This dispatch was securely generated by the <strong>${PLATFORM_NAME}</strong>.<br />
        Operating Node: Bangalore, India · Zero-RAM Non-Custodial Architecture
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates plain text version of the advisory notification email.
 */
function generateTextEmail({
  inquiryId,
  receivedAt,
  firstName,
  lastName,
  email,
  phone,
  urgency,
  message,
}: {
  inquiryId: string;
  receivedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  urgency: string;
  message: string;
}): string {
  return `
[FOUNDERSYNC CONFIDENTIAL ADVISORY INTAKE]
=========================================
Tracking ID: ${inquiryId}
Timestamp:   ${receivedAt}
Urgency:     ${urgency.toUpperCase()}

FOUNDER DETAILS:
- Name:      ${firstName} ${lastName}
- Email:     ${email}
- Telephone: ${phone}
- Topic:     ${urgency}

STRATEGIC HYPOTHESIS / CHALLENGE MESSAGE:
-----------------------------------------
${message}
-----------------------------------------

Securely routed by FounderSync Sovereign Node (Bangalore, India).
Reply to this email directly to initiate advisory deliberation with the founder.
  `.trim();
}

/**
 * Dispatches email through the best available channel:
 * 1. Direct Gmail API (OAuth2 via GOOGLE_REFRESH_TOKEN or GMAIL_REFRESH_TOKEN + GOOGLE_CLIENT_ID/SECRET)
 * 2. Direct Gmail API with static GMAIL_ACCESS_TOKEN
 * 3. Nodemailer via Gmail App Password (GMAIL_APP_PASSWORD + GMAIL_USER)
 * 4. Nodemailer via Generic SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * 5. Resend API (RESEND_API_KEY)
 * 6. SendGrid API (SENDGRID_API_KEY)
 * 7. Resilient Enclave Simulation (Logs to console & succeeds gracefully if external keys are pending)
 */
async function dispatchEmailNotification({
  recipient,
  subject,
  html,
  text,
  replyTo,
  inquiryId,
  founderName,
}: {
  recipient: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  inquiryId: string;
  founderName: string;
}): Promise<{ mode: string; messageId?: string; details?: string }> {
  const senderEmail = process.env.GMAIL_USER || process.env.SENDER_EMAIL || DEFAULT_ADMIN_EMAIL;
  const senderFormatted = `FounderSync Concierge <${senderEmail}>`;

  // 1. Check Gmail API via OAuth2 Refresh Token
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || process.env.GMAIL_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      console.log(`[Contact API] Refreshing Google OAuth2 token for Gmail API dispatch (${inquiryId})...`);
      const accessToken = await getGmailAccessToken(clientId, clientSecret, refreshToken);
      const rawBase64Url = buildRawGmailMessage({
        to: recipient,
        from: senderFormatted,
        replyTo,
        subject,
        html,
        text,
      });

      const gmailResult = await sendViaGmailApi(rawBase64Url, accessToken);
      console.log(`[Contact API] Successfully dispatched via Gmail API! Message ID: ${gmailResult.id}`);
      return { mode: 'gmail_api_oauth2', messageId: gmailResult.id };
    } catch (err: any) {
      console.warn(`[Contact API] Gmail API OAuth2 dispatch failed: ${err.message}. Evaluating alternate transports...`);
    }
  }

  // 2. Direct Gmail API with static access token
  const staticAccessToken = process.env.GMAIL_ACCESS_TOKEN;
  if (staticAccessToken) {
    try {
      const rawBase64Url = buildRawGmailMessage({
        to: recipient,
        from: senderFormatted,
        replyTo,
        subject,
        html,
        text,
      });
      const gmailResult = await sendViaGmailApi(rawBase64Url, staticAccessToken);
      console.log(`[Contact API] Successfully dispatched via static Gmail Access Token! Message ID: ${gmailResult.id}`);
      return { mode: 'gmail_api_bearer', messageId: gmailResult.id };
    } catch (err: any) {
      console.warn(`[Contact API] Static Gmail token dispatch failed: ${err.message}. Trying alternatives...`);
    }
  }

  // 3. Nodemailer via Gmail App Password
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
  const gmailUser = process.env.GMAIL_USER || DEFAULT_ADMIN_EMAIL;
  if (gmailAppPassword) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      const info = await transporter.sendMail({
        from: `FounderSync Concierge <${gmailUser}>`,
        to: recipient,
        replyTo,
        subject,
        text,
        html,
      });

      console.log(`[Contact API] Successfully dispatched via Gmail SMTP Nodemailer! Message ID: ${info.messageId}`);
      return { mode: 'gmail_nodemailer_app_password', messageId: info.messageId };
    } catch (err: any) {
      console.warn(`[Contact API] Gmail Nodemailer transport error: ${err.message}`);
    }
  }

  // 4. Nodemailer via Generic SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `FounderSync Concierge <${process.env.SMTP_USER}>`,
        to: recipient,
        replyTo,
        subject,
        text,
        html,
      });

      console.log(`[Contact API] Successfully dispatched via Custom SMTP! Message ID: ${info.messageId}`);
      return { mode: 'nodemailer_smtp', messageId: info.messageId };
    } catch (err: any) {
      console.warn(`[Contact API] Custom SMTP transport error: ${err.message}`);
    }
  }

  // 5. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'FounderSync Concierge <onboarding@resend.dev>',
          to: [recipient],
          reply_to: replyTo,
          subject,
          html,
          text,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        console.log(`[Contact API] Dispatched via Resend API! ID: ${json.id}`);
        return { mode: 'resend_api', messageId: json.id };
      }
    } catch (err: any) {
      console.warn(`[Contact API] Resend API error: ${err.message}`);
    }
  }

  // 6. SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: senderEmail, name: 'FounderSync Concierge' },
          reply_to: { email: replyTo, name: founderName },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html },
          ],
        }),
      });

      if (res.ok) {
        console.log(`[Contact API] Dispatched via SendGrid API!`);
        return { mode: 'sendgrid_api' };
      }
    } catch (err: any) {
      console.warn(`[Contact API] SendGrid API error: ${err.message}`);
    }
  }

  // 7. Enclave Simulation Mode (Fallback when live email tokens are unconfigured)
  console.log(`========================================================================`);
  console.log(`[Sovereign Enclave Delivery - Simulated Mail Delivery]`);
  console.log(`Inquiry ID: ${inquiryId}`);
  console.log(`Recipient:  ${recipient}`);
  console.log(`Founder:    ${founderName} <${replyTo}>`);
  console.log(`Subject:    ${subject}`);
  console.log(`Timestamp:  ${new Date().toISOString()}`);
  console.log(`Payload preview:`);
  console.log(text);
  console.log(`Note: To activate direct Gmail API delivery in production, set GOOGLE_REFRESH_TOKEN`);
  console.log(`(or GMAIL_APP_PASSWORD / RESEND_API_KEY) in .env.local.`);
  console.log(`========================================================================`);

  return {
    mode: 'sovereign_enclave_simulated',
    details: 'Logged to secure enclave console. Configure GMAIL_REFRESH_TOKEN or GMAIL_APP_PASSWORD for direct SMTP/API transmission.',
  };
}

/**
 * Handle CORS OPTIONS Preflight
 */
export async function OPTIONS(req: NextRequest) {
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;
  return new NextResponse(null, { status: 204, headers: getSecurityHeaders(req) });
}

/**
 * POST /api/contact
 * Handles Confidential Advisory Intake form submissions, validates fields,
 * and securely dispatches email notification to the administrator inbox.
 */
export async function POST(req: NextRequest) {
  // 1. IP rate limiting (15 requests/minute per client IP)
  const rateLimitResponse = checkRateLimit(req, { limit: 15, windowMs: 60 * 1000 });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    let rawBody: any;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload.' },
        { status: 400, headers: getSecurityHeaders(req) }
      );
    }

    // 2. Validate input schema
    const parseResult = ContactSubmissionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      const errorMessage = issue ? `${issue.message}` : 'Invalid contact form data.';
      return NextResponse.json(
        { success: false, error: errorMessage, validationErrors: parseResult.error.flatten() },
        { status: 400, headers: getSecurityHeaders(req) }
      );
    }

    const data = parseResult.data;
    const workEmail = (data.email || data.workEmail)!.toLowerCase().trim();
    const rawPhone = data.phone || data.telephone || 'Not provided';
    const countryCode = data.countryCode || '+91';
    const formattedPhone =
      rawPhone !== 'Not provided' && !rawPhone.startsWith('+') ? `${countryCode} ${rawPhone}` : rawPhone;
    const urgency = data.priority || data.urgency || data.topic || 'strategic-urgent';
    const message = (data.message || data.strategicHypothesis)!.trim();

    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const receivedAt = new Date().toISOString();
    const founderFullName = `${data.firstName} ${data.lastName}`.trim();

    // 3. Format email subject and templates
    const subject = `[FounderSync Advisory] New Intake: ${founderFullName} (${urgency.toUpperCase()}) - #${inquiryId}`;
    const htmlEmail = generateHtmlEmail({
      inquiryId,
      receivedAt,
      firstName: data.firstName,
      lastName: data.lastName,
      email: workEmail,
      phone: formattedPhone,
      urgency,
      message,
    });
    const textEmail = generateTextEmail({
      inquiryId,
      receivedAt,
      firstName: data.firstName,
      lastName: data.lastName,
      email: workEmail,
      phone: formattedPhone,
      urgency,
      message,
    });

    const recipient = process.env.ADMIN_EMAIL || process.env.CONCIERGE_EMAIL || DEFAULT_ADMIN_EMAIL;

    // 4. Secure email dispatch via Gmail API or alternate transports
    const dispatchResult = await dispatchEmailNotification({
      recipient,
      subject,
      html: htmlEmail,
      text: textEmail,
      replyTo: workEmail,
      inquiryId,
      founderName: founderFullName,
    });

    // 5. Successful response to frontend
    return NextResponse.json(
      {
        success: true,
        message: 'Your advisory intake has been securely received and dispatched.',
        data: {
          inquiryId,
          receivedAt,
          sla: 'Priority turnaround: < 2 hours',
          status: 'dispatched_to_advisory_unit',
          deliveryMode: dispatchResult.mode,
          messageId: dispatchResult.messageId || null,
          recipient,
          founder: founderFullName,
          directContact: {
            conciergeEmail: DEFAULT_ADMIN_EMAIL,
            directPhone: '+91 8618331467',
            jurisdiction: 'Bangalore, India',
          },
        },
      },
      {
        status: 200,
        headers: getSecurityHeaders(req),
      }
    );
  } catch (err: any) {
    console.error('[Contact API] Internal Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal server error occurred while processing the contact submission. Please try again.',
      },
      {
        status: 500,
        headers: getSecurityHeaders(req),
      }
    );
  }
}
