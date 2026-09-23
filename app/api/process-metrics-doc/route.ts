import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabaseAuthServer';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSecurityHeaders } from '@/lib/security';

export const runtime = 'nodejs';

// Maximum allowed document size: 5MB (prevents buffer allocation DoS)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Magic bytes for PDF: %PDF
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46];

// Allowed character set for CSV / text files
const SAFE_TEXT_REGEX = /^[\w\s,.\-"'/%$€£:;+=\n\r()\[\]{}]+$/;

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check (20 requests per minute per IP / User)
  const rateLimitError = checkRateLimit(req, { limit: 20, windowMs: 60 * 1000 });
  if (rateLimitError) {
    return rateLimitError;
  }

  // 2. Session verification
  const auth = await getAuthenticatedSupabaseClient(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error || 'Unauthorized: Active session required for document ingestion.',
      },
      { status: 401, headers: getSecurityHeaders() }
    );
  }


  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No document file provided in form data under field "file".' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum permitted limit of 5MB.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Strict Magic Byte Verification (Reject spoofed Content-Type)
    const isPdf =
      buffer.length >= 4 &&
      PDF_MAGIC_BYTES.every((byte, index) => buffer[index] === byte);

    let extractedText = '';

    if (isPdf) {
      const rawString = buffer.toString('latin1');

      // 3. XML External Entity (XXE) Injection Guard for PDF metadata streams
      if (
        /<!ENTITY/i.test(rawString) ||
        /SYSTEM\s+["']/i.test(rawString) ||
        /PUBLIC\s+["']/i.test(rawString)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Security alert: Document rejected due to detected XML External Entity (XXE) declarations.',
          },
          { status: 400 }
        );
      }

      // Safe stream text extraction
      const textMatches = rawString.match(/\(([^)]+)\)\s*Tj/g) || [];
      extractedText = textMatches
        .map((m) => m.replace(/^\(|\)\s*Tj$/g, ''))
        .join(' ')
        .slice(0, 8000); // Enforce character cap
    } else {
      // Treat as CSV or plain text document
      const text = buffer.toString('utf8');

      // 4. Prototype Pollution & Insecure Deserialization Guard
      if (/(__proto__|constructor|prototype)/i.test(text)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Security alert: File contains prohibited prototype keys (__proto__, constructor, prototype).',
          },
          { status: 400 }
        );
      }

      if (!SAFE_TEXT_REGEX.test(text.slice(0, 1000))) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unsupported file encoding or invalid document content.',
          },
          { status: 415 }
        );
      }

      extractedText = text.slice(0, 8000);
    }

    // 5. Sanitize filename to prevent Path Traversal and XSS
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '_');

    return NextResponse.json({
      success: true,
      fileName: sanitizedFileName,
      extractedLength: extractedText.length,
      preview: extractedText.slice(0, 300),
      message: 'Document successfully parsed and verified against XXE and prototype pollution.',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing document.',
      },
      { status: 500 }
    );
  }
}
