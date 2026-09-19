import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const envFilePath = path.join(process.cwd(), '.env.local');

/**
 * Reads keys from .env.local or process.env
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
    const match = fileContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
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
 * Updates or creates keys in .env.local
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

  for (const [key, value] of Object.entries(updates)) {
    if (!value) continue;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += (content.endsWith('\n') || content === '' ? '' : '\n') + `${key}=${value}\n`;
    }
    // Update active runtime process.env immediately
    process.env[key] = value;
  }

  fs.writeFileSync(envFilePath, content.trim() + '\n', 'utf8');
}

export async function GET() {
  const config = getEnvConfig();
  return NextResponse.json({
    success: true,
    config: {
      geminiKey: config.geminiKey,
      grokKey: config.grokKey,
      geminiModel: config.geminiModel,
      grokModel: config.grokModel,
      isGeminiConfigured: Boolean(config.geminiKey),
      isGrokConfigured: Boolean(config.grokKey),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geminiKey, grokKey, geminiModel, grokModel } = body;

    const updates: Record<string, string> = {};

    if (geminiKey && typeof geminiKey === 'string' && geminiKey.trim()) {
      updates['GEMINI_API_KEY'] = geminiKey.trim();
    }
    if (grokKey && typeof grokKey === 'string' && grokKey.trim()) {
      const trimmed = grokKey.trim();
      updates['GROQ_API_KEY'] = trimmed;
      updates['GROK_API_KEY'] = trimmed;
      updates['XAI_API_KEY'] = trimmed;
    }
    if (geminiModel && typeof geminiModel === 'string' && geminiModel.trim()) {
      updates['GEMINI_MODEL'] = geminiModel.trim();
    }
    if (grokModel && typeof grokModel === 'string' && grokModel.trim()) {
      updates['GROQ_MODEL'] = grokModel.trim();
    }

    if (Object.keys(updates).length > 0) {
      updateEnvFile(updates);
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration saved permanently to .env.local and runtime environment.',
      updatedKeys: Object.keys(updates),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save configuration.',
      },
      { status: 500 }
    );
  }
}
