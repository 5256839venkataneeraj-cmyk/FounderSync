// Gemini Strategic Mirror & Analyst Caller Library
import { GrowthMetrics, HumanMetrics, Metric, StrategicAnalysisResult, TimeSeriesPoint } from '@/lib/types';
import { safeLogger } from './security';

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

export const GEMINI_SYSTEM_PROMPT = `
You are the "Strategic Mirror & Analyst" for FounderSync, an Industry 5.0 executive operating system.
Your mission is to interpret the founder's startup trajectory by synthesizing hard Growth Metrics (ARR, Churn, LTV, Burn Rate) with Human-Centric Sustainability signals (Team Burnout Index, Customer Trust Score, Founder Cognitive Load, Retention Sentiment).

Analyze the balance between revenue acceleration and human capacity.

You MUST respond ONLY with a raw, valid JSON object matching this schema precisely:
{
  "summary": "string: executive synthesis of the startup's current trajectory, defensibility, and operational stability (1-2 sentences)",
  "strengths": [
    "string: key foundational strength 1",
    "string: key foundational strength 2"
  ],
  "risks": [
    "string: critical vulnerability or burnout tension 1",
    "string: critical vulnerability or burnout tension 2"
  ],
  "recommendations": [
    "string: actionable, high-leverage sustainable intervention 1",
    "string: actionable, high-leverage sustainable intervention 2"
  ],
  "confidence": number (float between 0.0 and 1.0 representing data conviction)
}

Do not include markdown fences (like \`\`\`json), commentary, or extra text. Output strict JSON only.
`;

/**
 * Deterministic Mock Generator (no Math.random())
 * Dynamically derives strengths, risks, and recommendations from actual metric values.
 */
export function generateMockStrategicAnalysis(
  metrics?: Partial<GrowthMetrics & HumanMetrics> | Metric
): StrategicAnalysisResult {
  const m = metrics || {};
  const arr = Number(m.arr ?? 1450000);
  const churn = Number((m as any).churn_rate ?? (m as any).churnRate ?? 3.8);
  const ltv = Number(m.ltv ?? 24500);
  const burn = Number((m as any).burn_rate ?? (m as any).burnRate ?? 85000);
  const burnout = Number((m as any).team_burnout_index ?? (m as any).burnoutIndex ?? 68);
  const trust = Number((m as any).customer_trust_score ?? (m as any).customerTrustScore ?? 84);
  const cognitiveLoad = Number((m as any).founder_cognitive_load ?? (m as any).founderCognitiveLoad ?? 79);
  const retention = Number((m as any).retention_sentiment ?? (m as any).retentionSentiment ?? 62);

  // Deterministic calculations based on metric thresholds
  const isHighGrowth = arr >= 1000000;
  const isHealthyChurn = churn <= 4.0;
  const isBurnoutRisk = burnout >= 65;
  const isCognitiveExhaustion = cognitiveLoad >= 70;

  const strengths: string[] = [];
  if (isHighGrowth) strengths.push(`Strong ARR scale milestone at $${(arr / 1000000).toFixed(2)}M.`);
  if (isHealthyChurn) strengths.push(`Disciplined monthly gross churn retention at ${churn.toFixed(1)}%.`);
  if (trust >= 80) strengths.push(`Robust customer trust index (${trust}/100) providing pricing moat.`);
  if (strengths.length === 0) strengths.push('Core product-market foundation established in mid-market.');

  const risks: string[] = [];
  if (isBurnoutRisk) {
    risks.push(`Elevated team burnout index (${burnout}/100) threatening core engineering sprint velocity.`);
  }
  if (isCognitiveExhaustion) {
    risks.push(`Founder cognitive overload (${cognitiveLoad}/100) creating executive bottleneck in decision-making.`);
  }
  if (burn > 80000) {
    risks.push(`Monthly net burn rate ($${burn.toLocaleString()}) limits runway buffer to under 18 months.`);
  }
  if (risks.length === 0) {
    risks.push(`Market expansion costs may compress unit economics if CAC payback exceeds 14 months.`);
  }

  const recommendations: string[] = [];
  if (isBurnoutRisk) {
    recommendations.push('Institute temporary sprint scoping caps to bring team burnout under 55.');
  }
  recommendations.push('Automate recurring client onboarding workflows to lift gross margins toward 80%.');
  recommendations.push(`Leverage high customer trust (${trust}/100) to introduce annual enterprise upfront billing.`);

  // Deterministic confidence based on metrics completeness
  const confidence = Math.min(0.95, Math.max(0.70, Number(((100 - churn * 5) / 100).toFixed(2))));

  const summary = isBurnoutRisk
    ? `The startup maintains solid $${(arr / 1000000).toFixed(2)}M top-line traction with ${churn.toFixed(1)}% churn, but elevated team strain (${burnout}/100) indicates growth is cannibalizing human capacity.`
    : `The startup demonstrates healthy operational balance at $${(arr / 1000000).toFixed(2)}M ARR, with sustainable team bandwidth supporting strategic expansion.`;

  return {
    summary,
    strengths,
    risks,
    recommendations,
    confidence,
    model: `${GEMINI_MODEL} (deterministic simulation)`,
    simulated: true,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Analyzes startup metrics with Gemini.
 * Key precedence: request-scoped apiKey param -> process.env.GEMINI_API_KEY -> none (straight to mock).
 * Uses AbortController with an 8s timeout.
 * On failure, falls through to mock generator — never throws to the caller.
 */
export async function analyzeStrategyWithGemini(
  metrics?: Partial<GrowthMetrics & HumanMetrics> | Metric,
  timeSeries?: TimeSeriesPoint[],
  apiKey?: string
): Promise<StrategicAnalysisResult> {
  // Key precedence: param -> env -> none
  const resolvedKey = apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

  if (!resolvedKey) {
    return generateMockStrategicAnalysis(metrics);
  }

  // Model cascade: configured GEMINI_MODEL, then gemini-3.5-flash fallback
  const modelsToTry = [GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-3.6-flash'];

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      resolvedKey
    )}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Strict 8s timeout

    try {
      const payload = {
        metrics: metrics || {},
        timeSeriesTail: (timeSeries || []).slice(-4),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${GEMINI_SYSTEM_PROMPT}\n\nStartup Metrics Telemetry:\n${JSON.stringify(payload, null, 2)}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 2500,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        safeLogger.warn(`[Gemini] Model ${model} returned non-2xx status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        safeLogger.warn(`[Gemini] Model ${model} returned empty response`);
        continue;
      }

      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (
        typeof parsed.summary === 'string' &&
        Array.isArray(parsed.strengths) &&
        Array.isArray(parsed.risks) &&
        Array.isArray(parsed.recommendations)
      ) {
        return {
          summary: parsed.summary,
          strengths: parsed.strengths.map(String),
          risks: parsed.risks.map(String),
          recommendations: parsed.recommendations.map(String),
          confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.85,
          model,
          simulated: false,
          generatedAt: new Date().toISOString(),
        };
      } else {
        safeLogger.warn(`[Gemini] Model ${model} returned invalid JSON schema`);
        continue;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      safeLogger.warn(`[Gemini] Request to ${model} failed or timed out:`, err?.message || err);
      // Fall through to next model
    }
  }

  // Fall through to deterministic mock generator
  return generateMockStrategicAnalysis(metrics);
}
