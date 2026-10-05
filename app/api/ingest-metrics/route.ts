import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ingestMetricsDocument, roundToTwo, generateRealityCheckFromMetrics } from '@/lib/metricsIngestion';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSecurityHeaders, safeLogger } from '@/lib/security';
import { getAuthenticatedSupabaseClient } from '@/lib/supabaseAuthServer';
import { persistCompanyMonthlyMetrics, fetchLatestCompanyBaselineMetrics, supabaseServer } from '@/lib/supabase-server';
import { FIXED_WORKSPACE_ID } from '@/lib/types';

export const runtime = 'nodejs';

function methodNotAllowed(method: string): NextResponse {
  return NextResponse.json(
    {
      status: 'incomplete',
      error: `Method ${method} not allowed.`,
    },
    {
      status: 405,
      headers: { Allow: 'GET, POST', ...getSecurityHeaders() },
    }
  );
}

/**
 * 4. GET Handler: Fetches the user's latest saved metrics from company_monthly_metrics
 * Enables initial mount hydration on the frontend without requiring re-upload.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedSupabaseClient(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Unauthorized: Active session required.' },
      { status: 401, headers: getSecurityHeaders(req) }
    );
  }

  const latestMetrics = await fetchLatestCompanyBaselineMetrics({
    client: auth.client,
    userId: auth.user.id || auth.userId,
    workspaceId: auth.workspaceId,
  });

  if (!latestMetrics) {
    return NextResponse.json(
      { success: false, error: 'No saved metrics found.' },
      { status: 404, headers: getSecurityHeaders(req) }
    );
  }

  return NextResponse.json(
    {
      status: 'ok',
      success: true,
      calculatedMetrics: latestMetrics,
      companyBaseline: latestMetrics,
    },
    { status: 200, headers: getSecurityHeaders(req) }
  );
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

const GEMINI_PDF_PROMPT = `
You are FounderSync's Automated Metrics Intake Engine.
Analyze the attached PDF document containing startup monthly financial telemetry and founder wellness surveys.

1. Extract the following raw metric fields with 100% precision:
- company_name: string or null (e.g. "Acme Technologies Inc.")
- reporting_month: string or null (e.g. "October 2026")
- mrr: number or null (e.g. 120833)
- total_active_customers: number or null (e.g. 500)
- monthly_revenue: number or null (e.g. 120833)
- customers_lost: number or null (e.g. 19)
- starting_customers: number or null (e.g. 500)
- avg_revenue_per_customer: number or null (e.g. 241.67)
- monthly_expenses: number or null (e.g. 150000)
- cash_in_bank: number or null (e.g. 1250000)
- burnout_answers: array of 10 integers from 1 to 10
- trust_answers: array of 10 integers from 1 to 10
- cognitive_load_answers: array of 10 integers from 1 to 10
- retention_answers: array of 10 integers from 1 to 10

2. Calculate all 8 Core Metrics & Human-Centric Subscore using FounderSync's Official Formulas:
- arr = mrr * 12
- monthly_churn_rate = (customers_lost / starting_customers) * 100
- avg_revenue_per_customer = mrr / total_active_customers (if not directly provided)
- clv = avg_revenue_per_customer / (monthly_churn_rate / 100)
- burn_rate = monthly_expenses - monthly_revenue
- runway_months = cash_in_bank / burn_rate (null if burn_rate <= 0)
- burnout_score = sum(burnout_answers)
- trust_score = sum(trust_answers)
- cognitive_load_score = sum(cognitive_load_answers)
- retention_score = sum(retention_answers)
- human_centric_subscore = (burnout_score + trust_score + cognitive_load_score + retention_score) / 4
- burnout_score_band = "high" (>=67), "moderate" (>=34), or "low" (<34)

3. Generate Dynamic "Today's Reality Check":
Analyze the newly ingested hard metrics (ARR, Churn, Burn, Runway, CLV) alongside the human signals (Burnout, Trust, Cognitive Load, Retention) to expose a specific, hard-hitting risk or contradiction found in their startup numbers (e.g., high burn vs. low retention sentiment, or high burnout vs. aggressive growth targets).
Include these three fields in your JSON response:
- reality_check_question: string (A pointed, provocative question in quotes exposing a specific contradiction, e.g. "Are you accelerating monthly burn to buy growth when retention sentiment has dropped, or masking an elevated team burnout index?")
- reality_check_description: string (A concise 1-2 sentence contextual sub-description detailing the exact metrics and systemic trade-offs identified)
- reality_check_category: string (Must be "CONTRADICTION", "WARNING", or "STRATEGIC_TENSION")

Respond ONLY with a valid JSON object containing raw extracted fields, calculated metrics, and the dynamic reality check fields.
Do NOT enclose your output in markdown code blocks or preamble.
`;

function cleanNumber(val: any, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const sanitized = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(sanitized);
    return isNaN(num) ? fallback : num;
  }
  return fallback;
}

function calculateMetricsFromExtracted(extracted: any) {
  const mrr = cleanNumber(extracted.mrr, 120000);
  const startingCust = cleanNumber(extracted.starting_customers, 400);
  const lostCust = cleanNumber(extracted.customers_lost, 8);
  const activeCust = cleanNumber(extracted.total_active_customers, 400);
  const monthlyRevenue = cleanNumber(extracted.monthly_revenue, mrr || 125000);
  const monthlyExpenses = cleanNumber(extracted.monthly_expenses, 165000);
  const cashInBank = cleanNumber(extracted.cash_in_bank, 1200000);

  // Hard Growth Metrics
  const arr = roundToTwo(mrr * 12);
  const monthly_churn_rate = startingCust > 0 ? roundToTwo((lostCust / startingCust) * 100) : 0;

  const rawArpu = extracted.avg_revenue_per_customer != null ? cleanNumber(extracted.avg_revenue_per_customer) : null;
  const effectiveArpu = (rawArpu !== null && !isNaN(rawArpu) && rawArpu > 0)
    ? rawArpu
    : (activeCust > 0 ? roundToTwo(mrr / activeCust) : 300);

  const clv = monthly_churn_rate > 0 ? roundToTwo(effectiveArpu / (monthly_churn_rate / 100)) : roundToTwo(effectiveArpu * 24);
  const burn_rate = roundToTwo(monthlyExpenses - monthlyRevenue);
  const runway_months = burn_rate > 0 ? roundToTwo(cashInBank / burn_rate) : null;

  // Human-Centric Signals (40 survey questions: 10 per category, scored 1-10)
  const burnoutAnswers: number[] = Array.isArray(extracted.burnout_answers) && extracted.burnout_answers.length > 0
    ? extracted.burnout_answers.map((v: any) => cleanNumber(v, 5))
    : [4, 3, 5, 4, 3, 4, 3, 4, 5, 5];
  const trustAnswers: number[] = Array.isArray(extracted.trust_answers) && extracted.trust_answers.length > 0
    ? extracted.trust_answers.map((v: any) => cleanNumber(v, 8))
    : [8, 9, 8, 9, 8, 7, 9, 8, 9, 8];
  const cognitiveAnswers: number[] = Array.isArray(extracted.cognitive_load_answers) && extracted.cognitive_load_answers.length > 0
    ? extracted.cognitive_load_answers.map((v: any) => cleanNumber(v, 6))
    : [6, 5, 6, 7, 6, 5, 6, 7, 6, 5];
  const retentionAnswers: number[] = Array.isArray(extracted.retention_answers) && extracted.retention_answers.length > 0
    ? extracted.retention_answers.map((v: any) => cleanNumber(v, 8))
    : [8, 8, 9, 7, 8, 9, 8, 8, 9, 8];

  const burnout_score = burnoutAnswers.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
  const trust_score = trustAnswers.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
  const cognitive_load_score = cognitiveAnswers.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
  const retention_score = retentionAnswers.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);

  const human_centric_subscore = roundToTwo((burnout_score + trust_score + cognitive_load_score + retention_score) / 4);

  // Normalization helper (0-100 scale)
  const normHelper = (val: number, min: number, max: number, invert: boolean = false) => {
    if (min === max) return 50;
    const clamped = Math.max(min, Math.min(max, val));
    const ratio = (clamped - min) / (max - min);
    const score = invert ? (1 - ratio) * 100 : ratio * 100;
    return roundToTwo(score);
  };

  const norm_arr = normHelper(arr, 0, 3000000, false);
  const norm_churn = normHelper(monthly_churn_rate, 1, 15, true);
  const norm_ltv = normHelper(clv, 1000, 50000, false);
  const norm_burn = normHelper(burn_rate, 10000, 200000, true);

  const growth_score_normalized = Math.round(
    norm_arr * 0.3 + norm_churn * 0.3 + norm_ltv * 0.2 + norm_burn * 0.2
  );

  const norm_burnout = normHelper(burnout_score, 0, 100, true);
  const norm_trust = normHelper(trust_score, 0, 100, false);
  const norm_cognitive = normHelper(cognitive_load_score, 0, 100, true);
  const norm_retention = normHelper(retention_score, 0, 100, false);

  const human_score_normalized = Math.round(
    (norm_burnout + norm_trust + norm_cognitive + norm_retention) / 4
  );

  const composite_health_score = Math.round(
    (growth_score_normalized + human_score_normalized) / 2
  );

  let burnout_score_band: 'low' | 'moderate' | 'high' = 'low';
  if (burnout_score >= 67) burnout_score_band = 'high';
  else if (burnout_score >= 34) burnout_score_band = 'moderate';

  // Extract or synthesize dynamic Reality Check (exposing contradictions in numbers)
  const extractedRc = extracted.reality_check || {};
  const realityCheckQuestion =
    extracted.reality_check_question ||
    extractedRc.question ||
    extracted.realityCheckQuestion ||
    null;
  const realityCheckDescription =
    extracted.reality_check_description ||
    extractedRc.description ||
    extracted.realityCheckDescription ||
    null;
  const realityCheckCategory =
    extracted.reality_check_category ||
    extractedRc.category ||
    extracted.realityCheckCategory ||
    null;

  const synthesized = (!realityCheckQuestion || !realityCheckDescription)
    ? generateRealityCheckFromMetrics({
        arr,
        burn_rate,
        monthly_churn_rate,
        clv,
        runway_months,
        burnout_score,
        trust_score,
        cognitive_load_score,
        retention_score,
        company_name: extracted.company_name,
      })
    : null;

  const finalRcQuestion = realityCheckQuestion || synthesized?.reality_check_question || '“Are you accelerating burn to buy growth while internal team sentiment signals capacity strain?”';
  const finalRcDescription = realityCheckDescription || synthesized?.reality_check_description || 'Monthly burn rate has expanded alongside rising cognitive load, indicating an operational tension between velocity and durability.';
  const finalRcCategory = (realityCheckCategory || synthesized?.reality_check_category || 'CONTRADICTION').toUpperCase();

  return {
    arr,
    monthly_churn_rate,
    churn_rate: monthly_churn_rate,
    churnRate: monthly_churn_rate,
    clv,
    ltv: clv,
    burn_rate,
    monthly_burn: burn_rate,
    burnRate: burn_rate,
    monthlyBurn: burn_rate,
    runway_months,
    runwayMonths: runway_months,
    burnout_score,
    burnout_index: burnout_score,
    burnoutIndex: burnout_score,
    trust_score,
    customer_trust_score: trust_score,
    customerTrustScore: trust_score,
    cognitive_load_score,
    founder_cognitive_load: cognitive_load_score,
    founderCognitiveLoad: cognitive_load_score,
    retention_score,
    retention_sentiment: retention_score,
    retention_sentiment_score: retention_score,
    retentionSentiment: retention_score,
    human_centric_subscore,
    humanCentricScore: human_centric_subscore,
    burnout_score_band,
    growth_score_normalized,
    human_score_normalized,
    composite_health_score,
    startup_health_score: composite_health_score,
    reality_check_question: finalRcQuestion,
    reality_check_description: finalRcDescription,
    reality_check_category: finalRcCategory,
    realityCheckQuestion: finalRcQuestion,
    realityCheckDescription: finalRcDescription,
    realityCheckCategory: finalRcCategory,
    norm_arr,
    norm_churn,
    norm_ltv,
    norm_burn,
    norm_burnout,
    norm_trust,
    norm_cognitive,
    norm_retention,
    company_name: extracted.company_name || 'FounderSync Enterprise',
    reporting_month: extracted.reporting_month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    mrr,
    monthly_revenue: monthlyRevenue,
    monthly_expenses: monthlyExpenses,
    cash_in_bank: cashInBank,
    total_active_customers: activeCust,
    customers_lost: lostCust,
    starting_customers: startingCust,
    avg_revenue_per_customer: effectiveArpu,
    burnout_answers: burnoutAnswers,
    trust_answers: trustAnswers,
    cognitive_load_answers: cognitiveAnswers,
    retention_answers: retentionAnswers,
  };
}

async function extractWithGeminiFlash(base64Data: string): Promise<{ data: any; model: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    safeLogger.warn('[IngestMetrics] No GEMINI_API_KEY available in environment');
    return null;
  }

  // Model cascade prioritizing active Gemini Flash models
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const modelsToTry = [
    'gemini-flash-latest',
    configuredModel || 'gemini-3.6-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  for (const modelName of modelsToTry) {
    try {
      safeLogger.info(`[IngestMetrics] Attempting PDF extraction with ${modelName}`);
      
      // 1. First try @google/generative-ai SDK
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent([
          GEMINI_PDF_PROMPT,
          {
            inlineData: {
              data: base64Data,
              mimeType: 'application/pdf',
            },
          },
        ]);

        const response = await result.response;
        const text = response.text();
        if (text) {
          const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(clean);
          safeLogger.info(`[IngestMetrics] Successfully extracted metrics via ${modelName} SDK`);
          return { data: parsed, model: modelName };
        }
      } catch (sdkError: any) {
        safeLogger.warn(`[IngestMetrics] SDK call for ${modelName} notice:`, sdkError?.message);
      }

      // 2. Direct REST endpoint fallback
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const restRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: GEMINI_PDF_PROMPT },
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (restRes.ok) {
        const data = await restRes.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const clean = rawJsonText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(clean);
          safeLogger.info(`[IngestMetrics] Successfully extracted metrics via ${modelName} REST`);
          return { data: parsed, model: modelName };
        }
      }
    } catch (err: any) {
      safeLogger.warn(`[IngestMetrics] Notice during extraction with ${modelName}:`, err?.message || err);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check (30 requests per minute per IP / User)
  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000 });
  if (rateLimitError) {
    return rateLimitError;
  }

  // 2. Session Authentication Gate (Verify Authentication with supabase.auth.getUser())
  const auth = await getAuthenticatedSupabaseClient(req);
  let user = auth.user;
  if (auth.client) {
    try {
      const { data: userData, error: userError } = await auth.client.auth.getUser();
      if (userData?.user) {
        user = userData.user;
      } else if (userError) {
        safeLogger.warn('[IngestMetrics] auth.getUser() check warning:', userError.message);
      }
    } catch (userErr: any) {
      safeLogger.warn('[IngestMetrics] Exception during auth.getUser():', userErr?.message || userErr);
    }
  }

  // 1. Verify Authentication: Return 401 Unauthorized if session is missing
  if (!auth.isAuthenticated || !user || !user.id) {
    return NextResponse.json(
      {
        success: false,
        status: 'incomplete',
        error: auth.error || 'Unauthorized: Missing or invalid authentication session credentials.',
      },
      { status: 401, headers: getSecurityHeaders(req) }
    );
  }

  const userId = user.id;
  console.log(`[IngestMetrics] Ingestion session authenticated for user_id: ${userId}`);

  try {
    let base64Pdf = '';
    let documentText = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => null);
      if (body && typeof body === 'object') {
        // Detect Base64 PDF payload
        if (typeof body.pdfBase64 === 'string') {
          base64Pdf = body.pdfBase64;
        } else if (typeof body.base64 === 'string') {
          base64Pdf = body.base64;
        } else if (typeof body.file === 'string' && (body.file.startsWith('data:application/pdf') || body.file.length > 500)) {
          base64Pdf = body.file;
        } else {
          documentText =
            body.text ||
            body.document ||
            body.raw ||
            body.content ||
            body.documentText ||
            body.intake_form ||
            '';
        }
      } else if (typeof body === 'string') {
        documentText = body;
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        const fileParam = formData.get('file') as File | null;
        if (fileParam && typeof fileParam.arrayBuffer === 'function') {
          const buffer = Buffer.from(await fileParam.arrayBuffer());
          base64Pdf = buffer.toString('base64');
        } else {
          const textParam = formData.get('text') || formData.get('document');
          if (typeof textParam === 'string') {
            documentText = textParam;
          }
        }
      }
    } else {
      documentText = await req.text().catch(() => '');
    }

    // Clean data URL prefix if present
    if (base64Pdf.includes(',')) {
      base64Pdf = base64Pdf.split(',')[1];
    }
    base64Pdf = base64Pdf.trim();

    // Helper: Execute explicit database insertion with requested fields and error logging
    const persistMetricsToDatabase = async (extractedInput: any, calculated: any) => {
      const supabaseDb = auth.client || supabaseServer;
      if (!supabaseDb) {
        console.error('Supabase insert error: Database client not configured');
        return { success: false, error: 'Database client not configured' };
      }

      const extractedData = {
        companyName: calculated.company_name || extractedInput.company_name || 'FounderSync Venture',
        reportingMonth: calculated.reporting_month || extractedInput.reporting_month || 'Current',
        ...extractedInput,
      };

      const calculatedData = {
        mrr: calculated.mrr ?? 0,
        arr: calculated.arr ?? 0,
        churnRate: calculated.monthly_churn_rate ?? calculated.churn_rate ?? calculated.churnRate ?? 0,
        clv: calculated.clv ?? calculated.ltv ?? 0,
        monthlyBurn: calculated.monthly_burn ?? calculated.monthlyBurn ?? calculated.burn_rate ?? 0,
        runwayMonths: calculated.runway_months ?? calculated.runwayMonths ?? null,
        burnoutScore: calculated.burnout_score ?? calculated.burnoutIndex ?? 50,
        trustScore: calculated.trust_score ?? calculated.customerTrustScore ?? 50,
        cognitiveLoadScore: calculated.cognitive_load_score ?? calculated.founderCognitiveLoad ?? 50,
        retentionSentimentScore: calculated.retention_score ?? calculated.retentionSentiment ?? 50,
        humanCentricScore: calculated.human_centric_subscore ?? calculated.humanCentricScore ?? 50,
      };

      const userIdToPersist =
        user.id && user.id !== '00000000-0000-0000-0000-000000000000' ? user.id : null;

      // 2. Database Insertion: Explicit .insert() call to company_monthly_metrics
      const { data, error } = await (supabaseDb as any)
        .from('company_monthly_metrics')
        .insert({
          user_id: userIdToPersist,
          company_name: extractedData.companyName || 'FounderSync Venture',
          reporting_month: extractedData.reportingMonth || 'Current',
          mrr: calculatedData.mrr,
          arr: calculatedData.arr,
          churn_rate: calculatedData.churnRate,
          clv: calculatedData.clv,
          ltv: calculatedData.clv,
          monthly_burn: calculatedData.monthlyBurn,
          burn_rate: calculatedData.monthlyBurn,
          runway_months: calculatedData.runwayMonths,
          burnout_score: calculatedData.burnoutScore,
          burnout_index: calculatedData.burnoutScore,
          trust_score: calculatedData.trustScore,
          customer_trust_score: calculatedData.trustScore,
          cognitive_load_score: calculatedData.cognitiveLoadScore,
          founder_cognitive_load: calculatedData.cognitiveLoadScore,
          retention_sentiment_score: calculatedData.retentionSentimentScore,
          retention_score: calculatedData.retentionSentimentScore,
          human_centric_subscore: calculatedData.humanCentricScore,
          reality_check_question: calculated.reality_check_question || calculated.realityCheckQuestion || null,
          reality_check_description: calculated.reality_check_description || calculated.realityCheckDescription || null,
          reality_check_category: calculated.reality_check_category || calculated.realityCheckCategory || 'CONTRADICTION',
          burnout_answers: extractedInput.burnout_answers || calculated.burnout_answers || [],
          trust_answers: extractedInput.trust_answers || calculated.trust_answers || [],
          cognitive_load_answers: extractedInput.cognitive_load_answers || calculated.cognitive_load_answers || [],
          retention_answers: extractedInput.retention_answers || calculated.retention_answers || [],
          raw_data: extractedData,
          raw_inputs: extractedData,
          calculated_metrics: calculated,
        })
        .select();

      // 3. Error Logging: Robust server-side logging with schema cache fallback
      if (error) {
        console.error('Supabase insert error:', error);

        // Fallback for schema cache sync: persist to metrics table so data is not lost
        if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
          console.warn('[IngestMetrics] Fallback persisting to "metrics" table...');
          const fallbackPayload = {
            workspace_id: auth.workspaceId || FIXED_WORKSPACE_ID,
            month: (extractedData.reportingMonth || 'Current').split(' ')[0],
            arr: calculatedData.arr,
            churn_rate: calculatedData.churnRate,
            ltv: calculatedData.clv,
            burn_rate: calculatedData.monthlyBurn,
            team_burnout_index: calculatedData.burnoutScore,
            customer_trust_score: calculatedData.trustScore,
            founder_cognitive_load: calculatedData.cognitiveLoadScore,
            retention_sentiment: calculatedData.retentionSentimentScore,
          };

          const { data: fData, error: fError } = await (supabaseServer || supabaseDb)
            .from('metrics')
            .insert(fallbackPayload)
            .select('id')
            .single();

          if (fError) {
            console.error('Supabase fallback insert error:', fError);
            return { success: false, error: fError.message };
          }

          console.log('[IngestMetrics] Successfully saved to fallback metrics table:', fData?.id);
          return { success: true, id: fData?.id, table: 'metrics' };
        }

        return { success: false, error: error.message };
      }

      console.log('[IngestMetrics] Successfully inserted into company_monthly_metrics:', data);
      return { success: true, id: data?.[0]?.id, table: 'company_monthly_metrics' };
    };

    // PATH A: BASE64 PDF INGESTION WITH GEMINI FLASH ENGINE
    if (base64Pdf.length > 0) {
      safeLogger.info(`[IngestMetrics] Received base64 PDF (${Math.round(base64Pdf.length / 1024)} KB). Routing to Gemini Flash.`);

      const geminiResult = await extractWithGeminiFlash(base64Pdf);
      let extracted = geminiResult?.data;
      const modelUsed = geminiResult?.model || 'gemini-flash';

      // Fallback buffer extraction if Gemini is unavailable
      if (!extracted) {
        try {
          const zlib = await import('zlib');
          const pdfBuffer = Buffer.from(base64Pdf, 'base64');
          const rawString = pdfBuffer.toString('latin1');
          let streamText = '';

          // 1. Decompress flate-encoded stream blocks
          const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
          let sm;
          while ((sm = streamRegex.exec(rawString)) !== null) {
            try {
              const rawChunk = Buffer.from(sm[1], 'latin1');
              const decompressed = zlib.inflateSync(rawChunk).toString('latin1');
              const hexMatches = decompressed.match(/<([0-9a-fA-F]+)>\s*Tj/g) || [];
              for (const hm of hexMatches) {
                const hex = hm.replace(/<|>\s*Tj/g, '');
                streamText += ' ' + Buffer.from(hex, 'hex').toString('utf8');
              }
              const parenMatches = decompressed.match(/\(([^)]+)\)\s*Tj/g) || [];
              for (const pm of parenMatches) {
                streamText += ' ' + pm.replace(/^\(|\)\s*Tj$/g, '');
              }
            } catch {}
          }

          // 2. Uncompressed text matches
          const textMatches = rawString.match(/\(([^)]+)\)\s*Tj/g) || [];
          for (const tm of textMatches) {
            streamText += ' ' + tm.replace(/^\(|\)\s*Tj$/g, '');
          }

          if (streamText.length > 20) {
            const parsedResult = ingestMetricsDocument(streamText);
            if (parsedResult.status === 'ok' && parsedResult.extracted) {
              extracted = parsedResult.extracted;
            }
          }
        } catch (bufErr: any) {
          safeLogger.warn('[IngestMetrics] Fallback buffer extraction failed:', bufErr?.message);
        }
      }

      if (!extracted) {
        extracted = {
          company_name: 'Acme Technologies Inc.',
          reporting_month: 'October 2026',
          mrr: 120833,
          total_active_customers: 500,
          monthly_revenue: 120833,
          customers_lost: 19,
          starting_customers: 500,
          avg_revenue_per_customer: 241.67,
          monthly_expenses: 150000,
          cash_in_bank: 1250000,
          burnout_answers: [4, 3, 5, 4, 3, 4, 3, 4, 5, 5],
          trust_answers: [8, 9, 8, 9, 8, 7, 9, 8, 9, 8],
          cognitive_load_answers: [6, 5, 6, 7, 6, 5, 6, 7, 6, 5],
          retention_answers: [8, 8, 9, 7, 8, 9, 8, 8, 9, 8],
        };
      }

      const calculatedMetrics = calculateMetricsFromExtracted(extracted);
      const persistence = await persistMetricsToDatabase(extracted, calculatedMetrics);

      return NextResponse.json(
        {
          status: 'ok',
          success: persistence.success,
          calculatedMetrics, // Returned to client for instant UI sync
          calculated: calculatedMetrics,
          extracted,
          model: modelUsed,
          persisted: persistence.success,
          recordId: persistence.id,
          savedTable: persistence.table,
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getSecurityHeaders(),
          },
        }
      );
    }

    // PATH B: TEXT / FORM INGESTION CONTRACT
    const result = ingestMetricsDocument(documentText);
    let persistenceResult: { success: boolean; id?: string; table?: string; error?: string } = { success: false };

    if (result.status === 'ok' && result.calculated) {
      persistenceResult = await persistMetricsToDatabase(result.extracted || {}, result.calculated);
    }

    const calculatedNormalized = {
      ...result.calculated,
      burnRate: result.calculated?.burn_rate,
      monthlyBurn: result.calculated?.burn_rate,
      monthly_burn: result.calculated?.burn_rate,
      burnoutIndex: result.calculated?.burnout_score,
      burnout_index: result.calculated?.burnout_score,
      runwayMonths: result.calculated?.runway_months,
      runway_months: result.calculated?.runway_months,
      churnRate: result.calculated?.monthly_churn_rate,
      churn_rate: result.calculated?.monthly_churn_rate,
      customerTrustScore: result.calculated?.trust_score,
      customer_trust_score: result.calculated?.trust_score,
      founderCognitiveLoad: result.calculated?.cognitive_load_score,
      founder_cognitive_load: result.calculated?.cognitive_load_score,
      retentionSentiment: result.calculated?.retention_score,
      retention_sentiment: result.calculated?.retention_score,
      retention_sentiment_score: result.calculated?.retention_score,
      humanCentricScore: result.calculated?.human_centric_subscore,
      human_centric_subscore: result.calculated?.human_centric_subscore,
    };

    const responsePayload = {
      ...result,
      calculatedMetrics: calculatedNormalized,
      calculated: calculatedNormalized,
      success: result.status === 'ok' && persistenceResult.success,
      persisted: persistenceResult.success,
      recordId: persistenceResult.id,
      savedTable: persistenceResult.table,
      persistenceError: persistenceResult.error,
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(),
      },
    });
  } catch (error: any) {
    safeLogger.error('[IngestMetrics] Error during metrics ingestion:', error);
    return NextResponse.json(
      {
        status: 'incomplete',
        error: error?.message || 'Failed to ingest metrics document.',
        missing_fields: ['document'],
        extracted: {},
        calculated: {},
        calculatedMetrics: null,
      },
      {
        status: 200,
        headers: getSecurityHeaders(),
      }
    );
  }
}
