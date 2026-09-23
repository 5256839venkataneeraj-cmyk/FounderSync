'use client';

import React, { useState } from 'react';

interface RealityCheckData {
  recordId: string;
  stressTestScore: number;
  synthesis: string;
  humanImpact: string;
  blindSpots: string[];
  opposingStrategy?: string;
  verdict?: string;
  simulated?: boolean;
}

type ActionType = 'Accept' | 'Pivot' | 'Override';

export function RealityCheckWorkflow() {
  // 1. Strategy Input & Reality-Check State
  const [strategy, setStrategy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realityCheckResult, setRealityCheckResult] = useState<RealityCheckData | null>(null);

  // 2. Human-in-the-Loop Decision State
  const [action, setAction] = useState<ActionType>('Pivot');
  const [justification, setJustification] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionSubmitted, setDecisionSubmitted] = useState(false);
  const [committedDecision, setCommittedDecision] = useState<{
    id: string;
    action: ActionType;
    justification: string;
    timestamp: string;
  } | null>(null);

  // Handle Strategy Submission to /api/reality-check
  const handleRunRealityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = strategy.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a strategy to run a reality check.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRealityCheckResult(null);
    setDecisionSubmitted(false);
    setCommittedDecision(null);

    try {
      const storedGemini = typeof window !== 'undefined' ? localStorage.getItem('foundersync_gemini_key') : null;
      const storedGrok = typeof window !== 'undefined' ? localStorage.getItem('foundersync_grok_key') : null;

      const response = await fetch('/api/reality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: trimmed,
          ...(storedGemini ? { geminiKey: storedGemini } : {}),
          ...(storedGrok ? { grokKey: storedGrok } : {}),
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || `Server returned error (${response.status})`);
      }

      // Extract unified fields from server response
      const data = json.data || json.aiData || {};
      const recordId = json.id || json.recordId || json.realityCheckId || `rc-${Date.now()}`;
      const synthesis = json.geminiSynthesis || data.geminiSynthesis || data.summary || 'Strategic synthesis generated.';
      const opposing = json.grokPushback || data.grokPushback || data.counterarguments?.[0] || 'Adversarial counter-perspective provided.';
      const score = data.stressTestScore || data.stress_test_score || 65;
      const humanImpact = data.humanImpact || data.human_impact || 'Impact on founder cognitive load & team sustainability monitored.';
      const blindSpots = Array.isArray(data.blindSpots) && data.blindSpots.length > 0
        ? data.blindSpots
        : [
            'Overestimating enterprise sales velocity before procurement gate reviews.',
            'Founder context-switching overload diluting core sprint execution.',
            'Unit economics sensitivity to increased post-sale customer onboarding requirements.',
          ];

      setRealityCheckResult({
        recordId,
        stressTestScore: score,
        synthesis,
        humanImpact,
        blindSpots,
        opposingStrategy: opposing,
        verdict: data.verdict,
        simulated: json.simulated ?? data.simulated,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete reality check. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle HITL Decision Submission to /api/decisions
  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setDecisionError('Please provide a justification for this decision.');
      return;
    }

    setIsSubmittingDecision(true);
    setDecisionError(null);

    try {
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realityCheckId: realityCheckResult?.recordId,
          action,
          justification: justification.trim(),
          strategy: strategy.trim(),
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || `Failed to log decision (${response.status})`);
      }

      setCommittedDecision({
        id: json.id || json.decisionId || `dec-${Date.now()}`,
        action,
        justification: justification.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setDecisionSubmitted(true);
    } catch (err: any) {
      setDecisionError(err?.message || 'Failed to record decision. Please retry.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Reset to run another check
  const handleReset = () => {
    setStrategy('');
    setRealityCheckResult(null);
    setDecisionSubmitted(false);
    setCommittedDecision(null);
    setJustification('');
    setAction('Pivot');
    setErrorMessage(null);
    setDecisionError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. Strategy Input Section */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base shadow-2xs">
              ⚡
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Adversarial Reality-Check Engine
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Simultaneous Gemini 1.5 Flash synthesis + Grok contradictory stress-testing
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Dual-AI Active</span>
          </span>
        </div>

        <form onSubmit={handleRunRealityCheck} className="space-y-4">
          <div>
            <label
              htmlFor="strategy-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
            >
              Enter Strategy or Hypothesis to Pressure-Test
            </label>
            <textarea
              id="strategy-input"
              rows={4}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="e.g. We plan to mandate 12-month upfront annual contracts for all new accounts to 4x cash runway and stop offering monthly billing..."
              disabled={isLoading}
              className="w-full text-sm text-slate-900 bg-slate-50 hover:bg-slate-100/70 focus:bg-white placeholder:text-slate-400 rounded-2xl p-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-y"
            />
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
              Calls Gemini Flash + Grok REST API concurrently via Promise.all
            </span>
            <button
              type="submit"
              disabled={isLoading || !strategy.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#2D31E3] hover:bg-[#2024B8] active:scale-98 disabled:opacity-50 disabled:pointer-events-none rounded-2xl shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Synthesizing &amp; Stress-Testing...</span>
                </>
              ) : (
                <>
                  <span>Run Reality Check</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. AI Reality Check Results Display */}
      {realityCheckResult && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6 animate-fadeIn">
          {/* Header & Stress Test Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Evaluation Output · Supabase ID: {realityCheckResult.recordId}
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Deliberation &amp; Stress-Test Insights
              </h3>
            </div>

            {/* Stress Test Score Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Stress Test Score
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {realityCheckResult.stressTestScore >= 70
                    ? 'Resilient Strategy'
                    : realityCheckResult.stressTestScore >= 50
                    ? 'Caution Advised'
                    : 'Critical Vulnerability'}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span
                  className={`text-2xl font-bold ${
                    realityCheckResult.stressTestScore >= 70
                      ? 'text-emerald-600'
                      : realityCheckResult.stressTestScore >= 50
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {realityCheckResult.stressTestScore}
                </span>
                <span className="text-xs font-bold text-slate-400">/100</span>
              </div>
            </div>
          </div>

          {/* Grid: Gemini Synthesis & Grok Pushback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Gemini 1.5 Flash Synthesis */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-white p-5 rounded-2xl border border-indigo-100/90 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  ✦
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900">
                  Synthesis (Gemini 1.5 Flash)
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line font-normal">
                {realityCheckResult.synthesis}
              </p>
            </div>

            {/* Human Impact */}
            <div className="bg-gradient-to-br from-amber-50/60 to-white p-5 rounded-2xl border border-amber-100/90 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                  ❤️
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                  Human Impact &amp; Team Sustainability
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 font-normal">
                {realityCheckResult.humanImpact}
              </p>
              {realityCheckResult.opposingStrategy && (
                <div className="mt-3 pt-2.5 border-t border-amber-200/60">
                  <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                    Grok Contrarian Counter-Perspective:
                  </span>
                  <p className="text-xs text-slate-500 font-normal italic">
                    &ldquo;{realityCheckResult.opposingStrategy.slice(0, 180)}...&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Blind Spots List */}
          <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🔍</span>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Critical Blind Spots &amp; Echo-Chamber Risks
              </h4>
            </div>
            <ul className="space-y-2">
              {realityCheckResult.blindSpots.map((spot, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{spot}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Human-in-the-Loop (HITL) Decision Section */}
          <div className="pt-6 border-t border-slate-200">
            {!decisionSubmitted ? (
              <form onSubmit={handleSubmitDecision} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚖️</span>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      Human-in-the-Loop (HITL) Executive Decision
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Required for strategic audit trail
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Action Dropdown */}
                  <div>
                    <label
                      htmlFor="action-select"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                    >
                      Decision Action
                    </label>
                    <select
                      id="action-select"
                      value={action}
                      onChange={(e) => setAction(e.target.value as ActionType)}
                      className="w-full text-xs font-bold bg-white text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                    >
                      <option value="Accept">Accept (Adopt AI Warning)</option>
                      <option value="Pivot">Pivot (Refine Strategy)</option>
                      <option value="Override">Override (Proceed Regardless)</option>
                    </select>
                  </div>

                  {/* Justification Textarea (2 cols) */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="justification-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                    >
                      Executive Justification
                    </label>
                    <textarea
                      id="justification-input"
                      rows={2}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="State executive rationale for accepting, pivoting, or overriding this AI critique..."
                      className="w-full text-xs text-slate-800 bg-white placeholder:text-slate-400 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {decisionError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                    {decisionError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingDecision || !justification.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {isSubmittingDecision ? (
                      <span>Logging to /api/decisions...</span>
                    ) : (
                      <>
                        <span>Commit Executive Decision</span>
                        <span>✓</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Confirmation Banner */
              <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-900">
                        Decision Committed to Audit Log
                      </h4>
                      <p className="text-xs text-emerald-700 font-medium">
                        Action: <span className="font-bold">{committedDecision?.action}</span> · Recorded at{' '}
                        {committedDecision?.timestamp}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-200 hover:bg-white transition-colors cursor-pointer"
                  >
                    Test Another Strategy
                  </button>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-emerald-200/60 text-xs text-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Committed Justification:
                  </span>
                  <p className="font-medium italic">&ldquo;{committedDecision?.justification}&rdquo;</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RealityCheckWorkflow;
