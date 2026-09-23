'use client';

import React, { useState } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { RealityCheckWorkflow } from '@/components/RealityCheckWorkflow';
import { RealityCheckEngine } from '@/components/reality-check/RealityCheckEngine';
import { DecisionHub } from '@/components/hitl/DecisionHub';

export function AdvisorView() {
  const { recordDecision } = useFounderSync();
  const [activeSubTab, setActiveSubTab] = useState<'live-workflow' | 'case-study'>('live-workflow');
  const [showLiveEngine, setShowLiveEngine] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [justification, setJustification] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (justification.trim().length < 20) return;

    const res = recordDecision('ACCEPT_AND_OVERRIDE_AI', justification);
    if (res.success) {
      setActionSuccessMsg('Assumption verified and signed with founder justification.');
      setIsApproving(false);
      setJustification('');
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Case Meta Header (Figma Screen 3) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Case #14: Q4 Pricing Shift
            </span>
          </div>
          <span className="text-xs font-normal text-slate-500">
            Confidence Gap: <strong className="text-slate-800 font-bold">68% Dissonance</strong>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Contradictory Advisor
          </h1>

          {/* Segmented Switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('live-workflow')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'live-workflow'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Live Reality-Check Workflow
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('case-study')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'case-study'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 Case #14 Stance
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-normal flex items-center gap-2">
          <span>✓</span>
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Live Workflow View */}
      {activeSubTab === 'live-workflow' && (
        <RealityCheckWorkflow />
      )}

      {/* Side-by-Side Comparison (Figma Screen 3) */}
      {activeSubTab === 'case-study' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Founder Stance */}
        <div className="floating-card bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <span>👤</span> Founder Stance
              </span>
              <span className="text-slate-400 font-normal normal-case">Logged Oct 24</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Core Belief
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Your Current Hypothesis
              </h3>
            </div>

            {/* Quote Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <p className="text-base text-slate-700 font-normal leading-relaxed italic">
                &ldquo;Moving to mandatory annual upfront billing will reduce churn and improve our cash runway by 3.2x.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-600">
              <span>📈</span>
              <span>Optimistic Net ARR Target: $1.4M</span>
            </div>
            <span className="text-slate-400 font-normal">v1.2 Initial Draft</span>
          </div>
        </div>

        {/* Right Column: Adversarial Evaluation (Contradictory Advisor) */}
        <div className="floating-card animate-float-subtle bg-white rounded-3xl border-2 border-amber-300/80 p-6 sm:p-8 shadow-[0_12px_40px_rgba(245,158,11,0.06)] flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
              <span className="font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚖️</span> Adversarial Evaluation
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                ⚡ AI Reality Check
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Contrarian Vector
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Contradictory Advisor
              </h3>
            </div>

            {/* Highlighted Quote Box */}
            <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200">
              <p className="text-base text-slate-900 font-medium leading-relaxed">
                &ldquo;Mid-market buyer cycle will stall by 45 days. You risk killing organic founder word-of-mouth when early champions hit contract friction.&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold">
              <span>⚠️</span>
              <span>Flagged Vulnerability: Sales Velocity Inertia</span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Synthesized across 42 SaaS cohorts
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Action Bar (Figma Screen 3) */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setActionSuccessMsg('Case dismissed from active counter-deliberation.')}
            className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            ✕ Dismiss Reality Check
          </button>

          <button
            type="button"
            onClick={() => setIsApproving(!isApproving)}
            className="bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl border border-slate-300 shadow-xs transition-colors flex items-center gap-2"
          >
            <span>✓</span>
            <span>Approve Assumption</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLiveEngine(!showLiveEngine)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>{showLiveEngine ? 'Hide Simulation Drawer' : 'Explore Further'}</span>
            <span>→</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Press <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700">space</kbd> to initiate simulation scenarios or select an action above.
        </p>
      </div>
        </>
      )}

      {/* Justification Gate on "Approve Assumption" */}
      {isApproving && (
        <form
          onSubmit={handleApprove}
          className="max-w-2xl mx-auto p-6 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Mandatory Human Justification Gate
            </h4>
            <span className="text-xs text-amber-700 font-mono">
              {justification.trim().length} / 20 min chars
            </span>
          </div>
          <p className="text-xs text-amber-800">
            Industry 6.0 Human-Centric requirement: You must provide your rationale before approving an assumption flagged with high dissonance.
          </p>
          <textarea
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explain why you are approving this pricing shift despite sales velocity risks..."
            className="w-full text-xs sm:text-sm border border-amber-300 rounded-xl p-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsApproving(false)}
              className="text-xs text-slate-600 px-3 py-1.5 rounded-lg hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={justification.trim().length < 20}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              Confirm & Sign Decision
            </button>
          </div>
        </form>
      )}

      {/* Live Grok Reality-Check Drawer */}
      {showLiveEngine && (
        <div className="pt-6 border-t border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Grok Cross-Examination Engine
              </h3>
              <p className="text-xs text-slate-500">
                Submit any hypothesis to run real-time devil&apos;s advocate stress testing with the live Grok API.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLiveEngine(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕ Close Drawer
            </button>
          </div>
          <RealityCheckEngine />
        </div>
      )}

      {/* Decision Hub & Audit Log */}
      <div className="pt-8 border-t border-slate-200/80">
        <DecisionHub />
      </div>
    </div>
  );
}
