'use client';

import React, { useState } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { StrategicMirror } from '@/components/dashboard/StrategicMirror';
import { StrategicAnalyst } from '@/components/dashboard/StrategicAnalyst';

interface DashboardViewProps {
  onNavigateToAdvisor: () => void;
}

type SectionView = 'overview' | 'assumptions' | 'contradictions' | 'radar';

const ACTIVE_ASSUMPTIONS = [
  {
    id: '1',
    category: 'GTM & PRICING',
    title: 'Mandatory annual upfront billing reduces churn and quadruples cash runway',
    description: 'Hypothesis that self-serve customers will accept 12-month lock-in without reducing sign-up velocity.',
    convictionScore: 84,
    status: 'Prioritized Today',
  },
  {
    id: '2',
    category: 'PRODUCT FOCUS',
    title: 'Building enterprise SSO and audit logs unlocks tier-1 fintech closes',
    description: 'Current hypothesis that compliance features are the sole blocker for 5 mid-market trials.',
    convictionScore: 78,
    status: 'Prioritized Today',
  },
  {
    id: '3',
    category: 'ACQUISITION',
    title: 'Founder-led outbound on LinkedIn yields higher LTV than product-led organic inbound',
    description: 'Testing if executive direct messaging justifies high founder cognitive time expenditure.',
    convictionScore: 65,
    status: 'Under Review',
  },
  {
    id: '4',
    category: 'UNIT ECONOMICS',
    title: 'Per-seat expansion margin exceeds usage-based compute infra costs by 4.2x',
    description: 'Assumption that team seat additions have near-zero marginal operational cost.',
    convictionScore: 72,
    status: 'Under Review',
  },
];

export function DashboardView({ onNavigateToAdvisor }: DashboardViewProps) {
  const { healthScore, state } = useFounderSync();
  const {
    userName,
    setIsNameModalOpen,
    greeting,
    currentDateFormatted,
    isCalendarConnected,
    setIsCalendarModalOpen,
  } = useUserProfile();
  const [selectedSection, setSelectedSection] = useState<SectionView>('overview');

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Top Header: Kicker, Date Badge & Title */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse glow-indicator"></span>
            <span className="text-[11px] sm:text-xs font-grotesk font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              EXECUTIVE REFLECTION &amp; SOUNDING BOARD
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Download Metrics Intake Template (Standardized v1.0) */}
            <a
              href="/templates/FounderSync_Input_Template.pdf"
              download="FounderSync_Input_Template.pdf"
              title="Download standardized Monthly Metrics Intake Form (v1.0)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#1A1A22] hover:bg-indigo-50 dark:hover:bg-[#22222E] hover:border-indigo-300 dark:hover:border-indigo-400/40 text-xs font-semibold text-slate-700 dark:text-[#F1F1F5] hover:text-indigo-600 dark:hover:text-indigo-300 shadow-2xs transition-all cursor-pointer group"
            >
              <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="font-grotesk font-bold">Download Metrics Template</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono">v1.0</span>
            </a>

            {/* Dynamic Everyday Date with Google Calendar Sync integration */}
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              title="Google Calendar Integration: Click to view schedule and calendar sync"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#1A1A22] hover:bg-slate-50 dark:hover:bg-[#22222E] hover:border-indigo-300 dark:hover:border-indigo-400/40 text-xs font-semibold text-slate-700 dark:text-[#F1F1F5] shadow-2xs transition-all cursor-pointer group"
            >
              <svg className="w-3.5 h-3.5 text-[#4285F4] group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
              <span className="font-grotesk font-bold text-slate-800 dark:text-slate-200">{currentDateFormatted}</span>
              <span className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${isCalendarConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="hidden sm:inline font-semibold">{isCalendarConnected ? 'Google Calendar' : 'Connect GCal'}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Greeting with Dynamic Founder Name & Quick Edit Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] tracking-tight leading-tight">
            {greeting}, {userName}
          </h1>
          <button
            type="button"
            onClick={() => setIsNameModalOpen(true)}
            title="Change founder username"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 bg-white dark:bg-[#1A1A22] hover:bg-indigo-50 dark:hover:bg-[#22222E] border border-slate-200/80 dark:border-white/10 hover:border-indigo-200 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="font-grotesk tracking-wide">Edit Name</span>
          </button>
        </div>

        {/* View Section Filters */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mr-1">
              VIEW SECTION:
            </span>

            <button
              type="button"
              onClick={() => setSelectedSection('overview')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedSection === 'overview'
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#1A1A22] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#22222E] hover:text-slate-900 dark:hover:text-[#F1F1F5]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSection('assumptions')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedSection === 'assumptions'
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#1A1A22] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#22222E] hover:text-slate-900 dark:hover:text-[#F1F1F5]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Assumptions Under Review</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSection('contradictions')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedSection === 'contradictions'
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#1A1A22] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#22222E] hover:text-slate-900 dark:hover:text-[#F1F1F5]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Contradictions &amp; Blind Spots</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSection('radar')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedSection === 'radar'
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#1A1A22] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#22222E] hover:text-slate-900 dark:hover:text-[#F1F1F5]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Conviction Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Card: Today's Reality Check (Floating Box with Smooth Levitation) */}
      <div className="floating-card animate-float-subtle relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-white to-[#FFF9F2] dark:from-[#1A1A22] dark:via-[#1A1A22] dark:to-[#1F1D2B] border border-slate-200/90 dark:border-white/10 p-7 sm:p-9 shadow-[0_16px_45px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.4)] transition-colors duration-300">
        {/* Subtle atmospheric ambient blurs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          {/* Luminous 3D Contradiction Sphere & Floating Contradiction Badge */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/25 to-amber-300/20 blur-2xl animate-pulse-glow" />
              <img
                src="/reality-check-sphere.png"
                alt="Contradiction Reality Sphere"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain relative z-10 drop-shadow-xl animate-float transition-transform hover:scale-105"
              />
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 text-center md:text-left space-y-3.5">
            <div className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-xs font-grotesk font-bold uppercase tracking-wider">
              <span>💡</span>
              <span>TODAY&apos;S REALITY CHECK</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-display font-bold text-slate-900 dark:text-[#F1F1F5] leading-snug tracking-tight">
              &ldquo;Are you building enterprise features because customers demanded them, or because your largest competitor just announced them?&rdquo;
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-sans font-normal">
              Three upcoming Q4 roadmapped deliverables lean heavily on competitive parity rather than validated problem discovery from your core ICP.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="bg-[#2D31E3] dark:bg-indigo-600 hover:bg-[#2024B8] dark:hover:bg-indigo-500 active:scale-98 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:translate-y-[-1px]"
              >
                <span>Review insights</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="bg-white dark:bg-[#14141C] hover:bg-slate-50 dark:hover:bg-[#22222E] active:scale-98 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/10 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:translate-y-[-1px]"
              >
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Inspect Audit Trail</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Metric Cards (Floating with Subtle Lift and Hover Interactions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 1: Active Assumptions */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-grotesk font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Assumptions
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] tracking-tight">
              4 Under Review
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal mt-1.5">
              2 prioritized for today&apos;s sounding board
            </p>
          </div>
        </div>

        {/* Card 2: Alignment Score */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-grotesk font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alignment Score
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] tracking-tight">
                88%
              </span>
              <span className="text-xs font-grotesk font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 shadow-2xs">
                ↑ 3% this week
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal mt-1.5">
              Team consensus on critical market wedges
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sub-sections Based on Filter Selection */}
      {selectedSection === 'overview' && (
        <div className="space-y-8 animate-fadeIn pt-2">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
            <StrategicMirror />
          </div>
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
            <StrategicAnalyst />
          </div>
        </div>
      )}

      {selectedSection === 'assumptions' && (
        <div className="animate-fadeIn pt-2">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
            <h3 className="text-sm font-grotesk font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 glow-indicator" />
              Active Strategic Assumptions (4 Under Review)
            </h3>
            <div className="space-y-3">
              {ACTIVE_ASSUMPTIONS.map((assump) => (
                <div
                  key={assump.id}
                  className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#14141C] border border-slate-200/80 dark:border-white/10 flex items-start justify-between gap-4 transition-all hover:bg-white dark:hover:bg-[#1C1C26] hover:shadow-xs"
                >
                  <div>
                    <span className="text-xs font-grotesk font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                      {assump.category} · Conviction: {assump.convictionScore}/100
                    </span>
                    <h4 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">{assump.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal mt-1">{assump.description}</p>
                  </div>
                  <span className="text-[11px] font-grotesk font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 dark:border dark:border-amber-500/20 shrink-0">
                    {assump.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedSection === 'contradictions' && (
        <div className="animate-fadeIn pt-2">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
            <StrategicAnalyst />
          </div>
        </div>
      )}

      {selectedSection === 'radar' && (
        <div className="animate-fadeIn pt-2">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8">
            <StrategicMirror />
          </div>
        </div>
      )}
    </div>
  );
}
