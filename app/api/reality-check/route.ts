import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseServer } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

const FIXED_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Calls Gemini 1.5 Flash model for strategic synthesis and opportunity evaluation.
 */
async function getGeminiSynthesis(strategy: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are FounderSync's Strategic Analyst AI. Analyze the following startup strategy and provide a sharp, structured strategic synthesis:
1. Core Strategic Thesis & Value Proposition
2. Growth Opportunities & Upside Scenarios
3. Strategic Trade-offs & Resource Demands

Founder Strategy:
"${strategy}"

Keep your synthesis executive-level, clear, and actionable (2-3 structured paragraphs).`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim();
}

/**
 * Calls Grok REST API (https://api.x.ai/v1/chat/completions) for adversarial reality-check pushback.
 */
async function getGrokPushback(strategy: string): Promise<string> {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not defined in environment.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const requestBody = {
    model: 'grok-beta',
    messages: [
      {
        role: 'system',
        content:
          'You are FounderSync\'s Adversarial Contradictory Advisor. Your duty is to break founder echo chambers by aggressively stress-testing assumptions, exposing hidden blind spots, pointing out unit economic flaws, and formulating a sharp counter-strategy.',
      },
      {
        role: 'user',
        content: `Expose all fatal flaws, cognitive biases, and provide adversarial counter-arguments to this strategy:\n"${strategy}"`,
      },
    ],
    temperature: 0.7,
  };

  try {
    let response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If x.ai returns an error and key is a Groq key (starts with gsk_), fallback to Groq endpoint
    if (!response.ok && apiKey.startsWith('gsk_')) {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
          messages: requestBody.messages,
          temperature: 0.7,
        }),
      });
      if (groqResponse.ok) {
        response = groqResponse;
      }
    }

    if (!response.ok) {
      throw new Error(`Grok REST API failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Grok REST API.');
    }

    return content.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * High-quality simulated AI data used as a fallback if APIs encounter rate-limits or network failures.
 */
function generateSimulatedData(strategy: string) {
  const blindSpots = [
    'Overestimating enterprise willingness-to-pay before validating actual procurement approval cycles.',
    'Underestimating founder cognitive load and context-switching tax across concurrent initiatives.',
    'Assuming unit margins will expand without accounting for increased customer support overhead.',
  ];

  const counterarguments = [
    `Adversarial Counter-Perspective: Committing upfront capital to "${strategy.slice(0, 80)}..." locks the company into rigid unit economics without testing elasticity.`,
    'Immediate pivot recommended: Stage a 14-day pre-commitment pilot before full operational rollout.',
  ];

  const geminiSynthesis = `Strategic Synthesis: The proposed strategy ("${strategy.slice(0, 100)}...") targets a critical market inflection point. The primary opportunity lies in accelerating customer acquisition and tightening retention through clear positioning. However, execution demands disciplined allocation of engineering focus, ensuring core unit margins remain insulated from customer acquisition cost inflation.`;

  const grokPushback = `Adversarial Pushback: The hypothesis relies on optimistic customer behavior and overlooks sales-cycle friction. Rushing this roadmap without testing counter-deliberations risks compounding founder cognitive load and diluting product velocity. Recommend stress-testing with customer advisory interviews before capital deployment.`;

  return {
    geminiSynthesis,
    grokPushback,
    strategyEvaluated: strategy,
    counterarguments,
    blindSpots,
    verdict: 'proceed_with_caution' as const,
    stressTestScore: 62,
    model: 'simulated-dual-ai (Gemini 1.5 Flash + Grok Fallback)',
    simulated: true,
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  let strategy = '';

  try {
    const json = await req.json().catch(() => null);
    strategy = json?.strategy?.trim() || '';

    if (!strategy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Strategy string is required in request body: { "strategy": "..." }',
        },
        { status: 400 }
      );
    }

    // Call Gemini 1.5 Flash and Grok REST API simultaneously using Promise.all
    const [geminiSynthesis, grokPushback] = await Promise.all([
      getGeminiSynthesis(strategy),
      getGrokPushback(strategy),
    ]);

    // Structured AI data
    const aiData = {
      geminiSynthesis,
      grokPushback,
      strategyEvaluated: strategy,
      counterarguments: [grokPushback.slice(0, 300)],
      blindSpots: [
        'Hidden operational complexity in scaling founder-led workflows.',
        'Market timing sensitivity and competing customer priorities.',
      ],
      verdict: 'proceed_with_caution' as const,
      model: 'gemini-1.5-flash + grok-beta',
      simulated: false,
      generatedAt: new Date().toISOString(),
    };

    // Insert combined data into Supabase reality_checks table using lib/supabaseServer.ts
    let recordId = `rc-${Date.now()}`;
    try {
      const primaryPayload = {
        strategy,
        gemini_model: 'gemini-1.5-flash',
        grok_model: 'grok-beta',
        synthesis: geminiSynthesis,
        blind_spots: aiData.blindSpots,
        human_impact: 'Monitored team sustainability & executive cognitive load',
        stress_test_score: 68,
        is_simulated: false,
      };

      let { data: record, error: insertError } = await (supabaseServer as any)
        .from('reality_checks')
        .insert(primaryPayload)
        .select('id')
        .single();

      if (insertError) {
        // Fallback to legacy schema if table hasn't migrated yet
        const fallback = await (supabaseServer as any)
          .from('reality_checks')
          .insert({
            workspace_id: FIXED_WORKSPACE_ID,
            input_text: strategy,
            blind_spots: aiData.blindSpots,
            opposing_strategy: grokPushback,
            human_impact: 'Monitored team sustainability & executive cognitive load',
            stress_test_score: 68,
            simulated: false,
          })
          .select('id')
          .single();
        record = fallback.data;
        insertError = fallback.error;
      }

      if (!insertError && record?.id) {
        recordId = record.id;
      } else if (insertError) {
        console.warn('[Reality-Check API] Supabase insert warning:', insertError.message);
      }
    } catch (dbErr: any) {
      console.warn('[Reality-Check API] Database write error:', dbErr.message);
    }

    // Return the Supabase record ID and the AI data to the client
    return NextResponse.json(
      {
        success: true,
        id: recordId,
        recordId: recordId,
        realityCheckId: recordId,
        geminiSynthesis,
        grokPushback,
        aiData,
        data: aiData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Fallback try/catch that returns simulated JSON if the APIs fail
    console.warn('[Reality-Check API] API call failed, generating simulated fallback:', error?.message || error);

    const fallbackStrategy = strategy || 'Strategy under review';
    const simulated = generateSimulatedData(fallbackStrategy);

    let recordId = `sim-${Date.now()}`;
    try {
      const { data: record } = await (supabaseServer as any)
        .from('reality_checks')
        .insert({
          workspace_id: FIXED_WORKSPACE_ID,
          input_text: fallbackStrategy,
          blind_spots: simulated.blindSpots,
          opposing_strategy: simulated.grokPushback,
          human_impact: 'Simulated team sustainability impact',
          stress_test_score: simulated.stressTestScore,
          simulated: true,
        })
        .select('id')
        .single();

      if (record?.id) {
        recordId = record.id;
      }
    } catch {
      // Ignore database insert error during fallback
    }

    return NextResponse.json(
      {
        success: true,
        id: recordId,
        recordId: recordId,
        realityCheckId: recordId,
        geminiSynthesis: simulated.geminiSynthesis,
        grokPushback: simulated.grokPushback,
        aiData: simulated,
        data: simulated,
        simulated: true,
      },
      { status: 200 }
    );
  }
}
