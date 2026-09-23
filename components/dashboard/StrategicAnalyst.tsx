'use client';

import React, { useState } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';

export function StrategicAnalyst() {
  const { state, runAnalysisGemini, isAnalyzingGemini, geminiError } = useFounderSync();
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const analysis = state.activeStrategicAnalysis;

  const handleRunAnalysis = async () => {
    await runAnalysisGemini(apiKey);
  };

  return (
    <div className="bg-white dark:bg-[#1A1A22] rounded-xl border border-slate-200 dark:border-white/10 p-6 shadow-sm dark:shadow-none space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
              Module 01 · Gemini Strategic Analyst
            </span>
            {analysis?.simulated ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 uppercase tracking-wider">
                Deterministic Mock
              </span>
            ) : analysis ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 uppercase tracking-wider">
                Live Gemini Model
              </span>
            ) : null}
          </div>
          <h3 className="text-base font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 mt-0.5">
            Synthesis & Market Defensibility Report
          </h3>
        </div>

        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={isAnalyzingGemini}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs w-fit"
        >
          {isAnalyzingGemini ? (
            <>
              <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Synthesizing Telemetry...</span>
            </>
          ) : (
            <>
              <span>⚡ Refresh Gemini Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Optional Gemini API Key Drawer */}
      <div className="text-xs">
        <button
          type="button"
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
        >
          <span>{showKeyInput ? '▼ Hide' : '▶ Configure'} Runtime Gemini Key</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            (Optional — in-memory only, never persisted)
          </span>
        </button>

        {showKeyInput && (
          <div className="mt-2 p-3 bg-slate-50 dark:bg-[#14141C] border border-slate-200 dark:border-white/10 rounded-lg space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Session Gemini API Key (sent per request to /api/strategic-analysis):
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 bg-white dark:bg-[#1A1A22] text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {geminiError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-medium">
          {geminiError}
        </div>
      )}

      {/* Analysis Content */}
      {analysis ? (
        <div className="space-y-5">
          {/* Executive Summary */}
          <div className="bg-slate-50 dark:bg-[#14141C] border border-slate-200 dark:border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                Executive Trajectory Synthesis:
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Confidence: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.round((analysis.confidence ?? 0.85) * 100)}%</strong>
                </span>
                {analysis.model && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    [{analysis.model}]
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Strengths & Risks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Foundational Strengths */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-500/20 rounded-lg p-4 space-y-2">
              <h4 className="text-xs uppercase font-semibold text-emerald-800 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
                <span>🛡️</span> Key Foundational Strengths:
              </h4>
              <ul className="space-y-1.5">
                {(analysis.strengths || []).map((s, i) => (
                  <li key={i} className="text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-1.5 leading-relaxed font-normal">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Risks & Burnout Tensions */}
            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-500/20 rounded-lg p-4 space-y-2">
              <h4 className="text-xs uppercase font-semibold text-rose-800 dark:text-rose-300 tracking-wider flex items-center gap-1.5">
                <span>⚠️</span> Critical Vulnerabilities & Tensions:
              </h4>
              <ul className="space-y-1.5">
                {(analysis.risks || []).map((r, i) => (
                  <li key={i} className="text-xs text-rose-950 dark:text-rose-200 flex items-start gap-1.5 leading-relaxed font-normal">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider mb-2">
              Actionable Sustainable Growth Interventions:
            </h4>
            <ul className="space-y-2">
              {(analysis.recommendations || []).map((rec, i) => (
                <li
                  key={i}
                  className="text-xs bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-3 text-indigo-950 dark:text-indigo-200 flex items-start gap-2 font-normal"
                >
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">0{i + 1}.</span>
                  <span className="leading-relaxed font-normal">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
          Click &quot;Refresh Gemini Analysis&quot; to synthesize current telemetry.
        </div>
      )}
    </div>
  );
}
