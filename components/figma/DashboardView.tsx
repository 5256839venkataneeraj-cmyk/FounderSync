'use client';

import React from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { StrategicMirror } from '@/components/dashboard/StrategicMirror';
import { StrategicAnalyst } from '@/components/dashboard/StrategicAnalyst';

interface DashboardViewProps {
  onNavigateToAdvisor: () => void;
}

export function DashboardView({ onNavigateToAdvisor }: DashboardViewProps) {
  const { healthScore } = useFounderSync();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Executive Reflection Greeting (Figma Screen 4) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
            Executive Reflection
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, Alex
          </h1>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Tuesday, October 24
        </div>
      </div>

      {/* Hero Card: Today's Reality Check (Figma Screen 4) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-amber-50/40 border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        {/* Subtle decorative background gradient blur */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 lg:gap-10">
          {/* Luminous 3D Contradiction Sphere */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full relative flex items-center justify-center p-3 shadow-xl bg-gradient-to-tr from-indigo-900 via-purple-700 to-amber-300">
              {/* Inner glowing sphere orb with specular highlights */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-200 via-indigo-600 to-slate-950 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="absolute top-3 right-6 w-10 h-10 rounded-full bg-white/40 blur-xs"></div>
                <div className="absolute bottom-4 left-6 w-12 h-12 rounded-full bg-amber-400/30 blur-sm"></div>
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 blur-md"></div>
              </div>
            </div>

            {/* Contradiction Pill Badge */}
            <div className="-mt-4 relative z-10 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-md border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Contradiction</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <span>💡</span>
              <span>Today’s Reality Check</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              &ldquo;Are you building enterprise features because customers demanded them, or because your largest competitor just announced them?&rdquo;
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              Three upcoming Q4 roadmapped deliverables lean heavily on competitive parity rather than validated problem discovery from your core ICP.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Review Insights</span>
                <span>→</span>
              </button>
              <span className="text-xs text-slate-400">
                Case #14 · Active Counter-Deliberation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Metric Cards (Figma Screen 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Active Assumptions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Active Assumptions
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              4 Under Review
            </div>
            <p className="text-xs text-slate-500 mt-1">
              2 prioritized for today&apos;s sounding board
            </p>
          </div>
        </div>

        {/* Card 2: Alignment Score */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Alignment Score
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                88%
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ↑ 3% this week
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Team consensus on critical market wedges
            </p>
          </div>
        </div>

        {/* Card 3: Startup Health Score (Calculated Composite) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Health Balance Index
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600 tracking-tight">
                {healthScore.compositeScore}/100
              </span>
              <span className="text-xs font-medium text-slate-500">
                (Growth: {healthScore.growthScoreNormalized} · Human: {healthScore.humanScoreNormalized})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              50/50 synthesis of revenue scale and team sustainability
            </p>
          </div>
        </div>
      </div>

      {/* Integrated Live Telemetry & Gemini Strategic Mirror */}
      <div className="space-y-6 pt-4 border-t border-slate-200/70">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Telemetry & Telemetry Synthesis
          </h3>
          <span className="text-xs text-slate-400">
            Powered by Gemini Strategic Mirror
          </span>
        </div>

        <StrategicMirror />
        <StrategicAnalyst />
      </div>
    </div>
  );
}
