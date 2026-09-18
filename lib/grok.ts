// Grok Reality-Check & Contradictory Advisor Caller Library
import { GrowthMetrics, HumanMetrics, Metric, RealityCheckResult } from '@/lib/types';
import { safeLogger } from './security';

export const GROK_MODEL = process.env.GROK_MODEL || 'grok-4.5';
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export const GROK_DEVILS_ADVOCATE_PROMPT = `
You are the "Contradictory Advisor & Reality-Check Engine" powered by Grok for FounderSync.
You are an uncompromising, highly adversarial devil's advocate. Your sole purpose is to stress-test founder assumptions, dismantle echo chambers, and prevent catastrophic strategic miscalculations.

Do NOT rubber-stamp the idea. Actively probe for unstated dependencies, competitive retaliation, execution friction, and human team fatigue.

You MUST respond ONLY with a raw, valid JSON object matching this schema precisely:
{
  "counterarguments": [
    "string: devastating commercial or structural counterargument 1",
    "string: devastating commercial or structural counterargument 2"
  ],
  "blindSpots": [
    "string: unaddressed execution, legal, or churn risk 1",
    "string: unaddressed execution, legal, or churn risk 2"
  ],
  "verdict": "reconsider" | "proceed_with_caution" | "proceed"
}

Verdict definitions:
- "reconsider": Extreme risk of capital destruction, irreparable team attrition, or severe unit economics degradation.
- "proceed_with_caution": High friction; requires strict guardrails, phased milestones, and kill criteria.
- "proceed": Structurally defensible with manageable, calculated risks.

Do not include markdown fences (like \`\`\`json), commentary, or extra text. Output strict JSON only.
`;

/**
 * Deterministic Mock Generator (keyword-based: hire, cut, scale, pivot, price)
 * Sets simulated: true.
 */
export function generateMockRealityCheck(
  strategyText: string
): RealityCheckResult {
  const trimmed = strategyText.trim();
  const lower = trimmed.toLowerCase();

  let counterarguments: string[];
  let blindSpots: string[];
  let verdict: 'proceed' | 'proceed_with_caution' | 'reconsider';

  if (lower.includes('price') || lower.includes('pricing') || lower.includes('monetiz')) {
    counterarguments = [
      'Abrupt pricing changes destroy early-adopter goodwill and trigger churn spikes that wipe out expected ACV expansion.',
      'Competitors will immediately launch aggressive targeted conquest campaigns with zero-friction migration guarantees.',
    ];
    blindSpots = [
      'Severe underestimation of customer switching willingness and support ticket escalation volume.',
      'Sales cycle elongation as new enterprise prospects demand custom discounting clauses.',
    ];
    verdict = 'reconsider';
  } else if (lower.includes('cut') || lower.includes('layoff') || lower.includes('downsize')) {
    counterarguments = [
      'Indiscriminate headcount reductions wipe out irreplaceable institutional domain memory and hidden technical dependencies.',
      'Survivor syndrome among remaining core contributors will depress morale, accelerate voluntary departures, and cripple sprint output.',
    ];
    blindSpots = [
      'Hidden operational bottlenecks that were previously managed manually by operational personnel.',
      'Enterprise pipeline perception risk regarding long-term company solvency.',
    ];
    verdict = 'reconsider';
  } else if (lower.includes('hire') || lower.includes('headcount') || lower.includes('recruiting')) {
    counterarguments = [
      'Brooks’s Law dictates that adding headcount to a late or complex software initiative temporarily slows overall delivery.',
      'Rapid hiring multiplies management overhead and dilutes startup cultural cohesion before productivity breakeven.',
    ];
    blindSpots = [
      'Senior engineer mentorship bandwidth diversion from roadmap critical-path deliverables.',
      'Burn rate acceleration compressing cash runway before revenue contribution materializes.',
    ];
    verdict = 'proceed_with_caution';
  } else if (lower.includes('scale') || lower.includes('growth') || lower.includes('expand')) {
    counterarguments = [
      'Pouring capital into customer acquisition before achieving retention saturation results in leaky-bucket unit economics.',
      'Expanding into adjacent verticals distracts leadership attention from defending the core revenue engine.',
    ];
    blindSpots = [
      'Degradation of core customer NPS as support and engineering resources are split across multiple fronts.',
      'CAC inflation in unproven acquisition channels requiring continuous outside funding.',
    ];
    verdict = 'proceed_with_caution';
  } else if (lower.includes('pivot') || lower.includes('reposition') || lower.includes('rebrand')) {
    counterarguments = [
      'Pivoting before exhausting current customer discovery cycles risks abandoning genuine market signals in favor of novelty.',
      'Repeated executive strategy shifts exhaust team confidence and breed internal skepticism about leadership direction.',
    ];
    blindSpots = [
      'Sunk technical investments that cannot be repurposed for the new value proposition.',
      'Existing pipeline revenue commitments that will churn upon platform redirection.',
    ];
    verdict = 'reconsider';
  } else {
    // General deterministic response based on string characteristics
    const len = trimmed.length;
    counterarguments = [
      'Assumes seamless market adoption without verifying whether current customer integration friction has been resolved.',
      'Fails to account for competitive retaliation once visible public marketing signals are deployed.',
    ];
    blindSpots = [
      'Lack of explicit quantitative kill criteria if target leading retention indicators fail within 60 days.',
      'Second-order ripple effects on core system uptime and engineer cognitive load.',
    ];
    verdict = len % 2 === 0 ? 'proceed_with_caution' : 'reconsider';
  }

  return {
    strategyEvaluated: trimmed,
    counterarguments,
    blindSpots,
    verdict,
    model: `${GROK_MODEL} (deterministic simulation)`,
    simulated: true,
    generatedAt: new Date().toISOString(),
  };
}


/**
 * Executes a Reality-Check and Contradictory Advisor stress-test.
 * Automatically supports:
 * 1. Groq (GroqCloud keys starting with 'gsk_') using fast LPU inference (llama-3.3-70b-versatile)
 * 2. xAI / Grok (keys starting with 'xai-') using grok-4.5
 * 3. Fallback to deterministic simulation generator on missing key, non-2xx status, or timeout
 */
export async function runRealityCheckWithGrok(
  strategyText: string,
  currentMetrics?: Partial<GrowthMetrics & HumanMetrics> | Metric,
  apiKey?: string
): Promise<RealityCheckResult> {
  const trimmed = strategyText.trim();
  const resolvedKey =
    apiKey?.trim() ||
    process.env.GROQ_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim() ||
    process.env.XAI_API_KEY?.trim();

  if (!resolvedKey) {
    return generateMockRealityCheck(trimmed);
  }

  // Determine provider: GroqCloud (gsk_...) vs xAI (xai-...)
  const isGroq = resolvedKey.startsWith('gsk_') || Boolean(process.env.GROQ_API_KEY);
  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.x.ai/v1/chat/completions';

  // Provider-specific model cascades
  const modelsToTry = isGroq
    ? [GROQ_MODEL, 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'groq/compound']
    : [GROK_MODEL, 'grok-4.5', 'grok-4-fast'];

  const payloadPrompt = `Founder Strategy Submission:\n"${trimmed}"\n\nCurrent Operating Context:\n${JSON.stringify(
    currentMetrics || {},
    null,
    2
  )}`;

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Strict 8s timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolvedKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: GROK_DEVILS_ADVOCATE_PROMPT,
            },
            {
              role: 'user',
              content: payloadPrompt,
            },
          ],
          temperature: 0.25,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        safeLogger.warn(`[${isGroq ? 'Groq' : 'Grok'}] Model ${model} returned non-2xx status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawContent = data?.choices?.[0]?.message?.content;

      if (!rawContent) {
        safeLogger.warn(`[${isGroq ? 'Groq' : 'Grok'}] Model ${model} returned empty content`);
        continue;
      }

      const cleanJson = rawContent.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed.counterarguments) && Array.isArray(parsed.blindSpots)) {
        const rawVerdict = String(parsed.verdict).toLowerCase();
        const verdict: 'proceed' | 'proceed_with_caution' | 'reconsider' =
          rawVerdict === 'proceed'
            ? 'proceed'
            : rawVerdict === 'proceed_with_caution'
            ? 'proceed_with_caution'
            : 'reconsider';

        return {
          strategyEvaluated: trimmed,
          counterarguments: parsed.counterarguments.map(String),
          blindSpots: parsed.blindSpots.map(String),
          verdict,
          model: `${model} (${isGroq ? 'Groq LPU' : 'xAI'})`,
          simulated: false,
          generatedAt: new Date().toISOString(),
        };
      } else {
        safeLogger.warn(`[${isGroq ? 'Groq' : 'Grok'}] Model ${model} returned non-conforming JSON schema`);
        continue;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      safeLogger.warn(`[${isGroq ? 'Groq' : 'Grok'}] Request to ${model} failed or timed out:`, err?.message || err);
      // Fall through to next model in cascade
    }
  }

  // If all models in cascade fail or timeout, fall back to deterministic simulation
  return generateMockRealityCheck(trimmed);
}
