'use client';

import React, { useState } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { AdvisorOutput } from './AdvisorOutput';

const SAMPLE_STRATEGIES = [
  'Increase enterprise prices by 40% immediately to double ARR before next round.',
  'Mandate an all-hands 80-hour sprint for Q3 to ship the new release 6 weeks early.',
  'Replace the entire tier-1 customer success team with an autonomous AI chatbot.',
  'Cut all exploratory R&D and double headcount in outbound sales reps.',
];

export function RealityCheckEngine() {
  const {
    activeStrategy,
    setActiveStrategy,
    activeCritique,
    isAnalyzing,
    analysisError,
    runAnalysis,
  } = useFounderSync();

  const [inputStrategy, setInputStrategy] = useState(activeStrategy || '');
  const [sessionApiKey, setSessionApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStrategy.trim() || isAnalyzing) return;
    await runAnalysis(inputStrategy, sessionApiKey);
  };

  const handleSelectSample = (sample: string) => {
    setInputStrategy(sample);
  };

  return (
    <div className="space-y-6">
      {/* Engine Input Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-4">
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
            Module 02 · Contradictory Advisor Engine
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Reality-Check & Devil’s Advocate
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit any strategic intuition or high-stakes decision. The engine simulates opposing market forces, surfaces blind spots, and evaluates human sustainability.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Strategy Textarea */}
          <div>
            <label htmlFor="strategy-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Founder Strategy / Proposition
            </label>
            <textarea
              id="strategy-input"
              rows={4}
              value={inputStrategy}
              onChange={(e) => setInputStrategy(e.target.value)}
              placeholder="e.g. 'We plan to sunset our freemium tier and require all users to upgrade to $99/mo or be suspended within 14 days...'"
              className="w-full text-sm border border-slate-300 rounded-lg p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isAnalyzing}
            />
          </div>

          {/* Preset Prompts / Quick Fill */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Test Traps:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_STRATEGIES.map((strat, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSample(strat)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded transition-colors text-left"
                >
                  ⚡ &quot;{strat.slice(0, 45)}...&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Optional Grok (xAI) API Key Drawer */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <span>{showKeyInput ? '▼ Hide' : '▶ Configure'} Grok API Key</span>
                <span className="text-slate-400 font-normal">
                  (Optional — defaults to deterministic mock generator)
                </span>
              </button>
            </div>

            {showKeyInput && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Session Grok API Key (Never stored in database, kept in memory only):
                </label>
                <input
                  type="password"
                  value={sessionApiKey}
                  onChange={(e) => setSessionApiKey(e.target.value)}
                  placeholder="xai-..."
                  className="w-full text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500">
                  Calls Grok with devil&apos;s advocate system prompt. If left blank or times out, falls back to deterministic simulation.
                </p>
              </div>
            )}
          </div>

          {/* Action Bar & Loading State */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              {inputStrategy.trim().length > 0 && (
                <span>{inputStrategy.trim().length} characters</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !inputStrategy.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Synthesizing Devil’s Advocate...</span>
                </>
              ) : (
                <>
                  <span>Run Reality-Check</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error State Banner */}
        {analysisError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <span className="font-bold">Error:</span>
            <span>{analysisError}</span>
          </div>
        )}
      </div>

      {/* Render Active Critique Output */}
      {activeCritique && <AdvisorOutput result={activeCritique} />}
    </div>
  );
}
