import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { getAuthenticatedSupabaseClient } from '@/lib/supabaseAuthServer';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSecurityHeaders } from '@/lib/security';

export const runtime = 'nodejs';

const envFilePath = path.join(process.cwd(), '.env.local');

// Strict Zod validation prohibiting CRLF characters and malformed keys
const SettingsUpdateSchema = z.object({
  geminiKey: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{15,70}$/, 'Invalid Gemini API key format (no whitespace or newlines allowed)')
    .optional(),
  grokKey: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{15,90}$/, 'Invalid Grok/Groq API key format (no whitespace or newlines allowed)')
    .optional(),
  geminiModel: z
    .enum(['gemini-1.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'])
    .optional(),
  grokModel: z
    .enum(['grok-beta', 'openai/gpt-oss-120b'])
    .optional(),
});

function maskKey(key?: string): string {
  if (!key || key.length < 8) return '';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

/**
 * Safely reads environment variables without risking prototype pollution.
 */
function getEnvConfig() {
  let fileContent = '';
  try {
    if (fs.existsSync(envFilePath)) {
      fileContent = fs.readFileSync(envFilePath, 'utf8');
    }
  } catch (err) {
    console.error('Failed to read .env.local:', err);
  }

  const getVal = (key: string, defaultVal: string = '') => {
    // Exact line match
    const match = fileContent.match(new RegExp(`^${key}=([^\\r\\n]*)$`, 'm'));
    if (match) return match[1].trim();
    return process.env[key] || defaultVal;
  };

  return {
    geminiKey: getVal('GEMINI_API_KEY', ''),
    grokKey: getVal('GROQ_API_KEY', getVal('GROK_API_KEY', getVal('XAI_API_KEY', ''))),
    geminiModel: getVal('GEMINI_MODEL', 'gemini-3.6-flash'),
    grokModel: getVal('GROQ_MODEL', 'openai/gpt-oss-120b'),
  };
}

/**
 * Updates keys in .env.local with strict CRLF neutralization.
 */
function updateEnvFile(updates: Record<string, string>) {
  let content = '';
  try {
    if (fs.existsSync(envFilePath)) {
      content = fs.readFileSync(envFilePath, 'utf8');
    }
  } catch (e) {
    content = '';
  }

  for (const [key, rawValue] of Object.entries(updates)) {
    // Neutralize any unexpected newlines or carriage returns
    const sanitizedVal = rawValue.replace(/[\r\n]/g, '').trim();
    if (!sanitizedVal) continue;

    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${sanitizedVal}`);
    } else {
      content += (content.endsWith('\n') || content === '' ? '' : '\n') + `${key}=${sanitizedVal}\n`;
    }
    // Update active runtime process.env immediately
    process.env[key] = sanitizedVal;
  }

  fs.writeFileSync(envFilePath, content.trim() + '\n', 'utf8');
}

export async function GET(req: NextRequest) {
  // Rate limiting (30 req/min)
  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  // Session check
  const auth = await getAuthenticatedSupabaseClient(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401, headers: getSecurityHeaders() });
  }

  const config = getEnvConfig();

  // Return MASKED keys only — never plaintext secrets
  return NextResponse.json({
    success: true,
    config: {
      geminiKey: maskKey(config.geminiKey),
      grokKey: maskKey(config.grokKey),
      geminiModel: config.geminiModel,
      grokModel: config.grokModel,
      isGeminiConfigured: Boolean(config.geminiKey),
      isGrokConfigured: Boolean(config.grokKey),
    },
  }, { headers: getSecurityHeaders() });
}

export async function POST(req: NextRequest) {
  // Rate limiting (30 req/min)
  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  // Session check
  const auth = await getAuthenticatedSupabaseClient(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401, headers: getSecurityHeaders() });
  }


  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ success: false, error: 'Request body is required.' }, { status: 400 });
    }

    const parsed = SettingsUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for model governance settings.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { geminiKey, grokKey, geminiModel, grokModel } = parsed.data;
    const updates: Record<string, string> = {};

    if (geminiKey) updates['GEMINI_API_KEY'] = geminiKey;
    if (grokKey) {
      updates['GROQ_API_KEY'] = grokKey;
      updates['GROK_API_KEY'] = grokKey;
      updates['XAI_API_KEY'] = grokKey;
    }
    if (geminiModel) updates['GEMINI_MODEL'] = geminiModel;
    if (grokModel) updates['GROQ_MODEL'] = grokModel;

    if (Object.keys(updates).length > 0) {
      updateEnvFile(updates);
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration saved permanently to .env.local and runtime environment.',
      updatedKeys: Object.keys(updates),
    }, { headers: getSecurityHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save configuration.',
      },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

