'use client';

import React, { useState } from 'react';
import { ConvictionChart } from '@/components/ConvictionChart';

const VERBATIMS = [
  {
    quote: "We loved the workflow builder during trial, but your pricing model forces us into enterprise tier just for SAML SSO. It's stalling legal approval.",
    source: "VP of Engineering, Mid-market Fintech (Tier-1 Account)",
    sentiment: "Caution",
  },
  {
    quote: "The product pivot in July solved 90% of our daily friction. Our team's internal sentiment went from frustrated to advocates in 3 weeks.",
    source: "Head of Operations, Series B SaaS (Design Partner)",
    sentiment: "Strong Positive",
  },
  {
    quote: "Seat-based minimums don't align with our quarterly contractor influx. We need usage-based flexibility or we will look at competitors in Q1.",
    source: "Director of Procurement, Enterprise Logistics",
    sentiment: "Warning",
  },
];

export function InsightsView() {
  const [showVerbatims, setShowVerbatims] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Meta (Figma Screen 2) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-grotesk font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Signal Analysis / Continuous Synthesis
          </span>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-grotesk font-semibold bg-slate-100 dark:bg-[#1A1A22] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Window: May – Oct 2024
            </span>
            <span className="px-3.5 py-1 rounded-full text-xs font-grotesk font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40">
              Bi-Weekly Cadence
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] tracking-tight">
          Team & Customer Insights
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl font-sans font-normal">
          Synthesized sentiment signals across founder, team, and customer conversations.
        </p>
      </div>

      {/* Conviction Alignment vs. Market Reality Chart (Interactive Component) */}
      <ConvictionChart />

      {/* 3 Real-time Pulse Cards (Figma Screen 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {/* Card 1: Buyer Intent */}
        <div className="floating-card bg-white dark:bg-[#1A1A22] rounded-3xl border border-slate-200/90 dark:border-white/10 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Buyer Intent
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F1F1F5]">
                Customer Urgency: +18%
              </span>
            </div>
          </div>
          <span className="text-slate-400 text-lg font-bold">↗</span>
        </div>

        {/* Card 2: Leadership Pulse */}
        <div className="floating-card bg-white dark:bg-[#1A1A22] rounded-3xl border border-slate-200/90 dark:border-white/10 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Leadership Pulse
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F1F1F5]">
                Internal Alignment: 84%
              </span>
            </div>
          </div>
          <span className="text-indigo-600 dark:text-indigo-400 text-lg font-bold">✓</span>
        </div>

        {/* Card 3: Contradiction Signal */}
        <div className="floating-card animate-float-subtle bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl border border-amber-200/90 dark:border-amber-500/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
              Contradiction Signal
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-200">
                Pricing Friction: Caution
              </span>
            </div>
          </div>
          <span className="text-amber-600 dark:text-amber-400 text-lg font-bold">⚠️</span>
        </div>
      </div>

      {/* Advisor Observation Box (Figma Screen 2) */}
      <div className="floating-card bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-[#1A1A22] rounded-3xl border border-indigo-100 dark:border-white/10 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300">
        <div className="flex items-start gap-3.5">
          <span className="text-2xl mt-0.5">💡</span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-1">
              Advisor Observation
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-3xl">
              Conviction surged post-pivot while market acceptance is steadily catching up. However, qualitative notes show 32% of tier-1 trial accounts flagged enterprise seat tiers as overly rigid.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowVerbatims(!showVerbatims)}
          className="bg-white dark:bg-[#1A1A22] hover:bg-slate-50 dark:hover:bg-[#22222E] text-indigo-700 dark:text-indigo-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-white/10 shadow-xs whitespace-nowrap transition-colors"
        >
          {showVerbatims ? 'Hide Verbatims' : 'Examine Verbatims'}
        </button>
      </div>

      {/* Verbatims Drawer Modal */}
      {showVerbatims && (
        <div className="bg-white dark:bg-[#1A1A22] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <h4 className="text-sm font-bold text-slate-900 dark:text-[#F1F1F5]">
              Customer & Team Voice Verbatims (Signal Evidence)
            </h4>
            <span className="text-xs text-slate-400 dark:text-slate-500">3 Verified Excerpts</span>
          </div>

          <div className="space-y-3">
            {VERBATIMS.map((v, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-[#14141C] border border-slate-200/80 dark:border-white/10 space-y-1.5">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  &ldquo;{v.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400 font-medium">
                  <span>— {v.source}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    {v.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
