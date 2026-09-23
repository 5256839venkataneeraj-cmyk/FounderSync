'use client';

import React, { useState } from 'react';

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
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            Signal Analysis / Continuous Synthesis
          </span>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Window: May – Oct 2024
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Bi-Weekly Cadence
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Team & Customer Insights
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl font-normal">
          Synthesized sentiment signals across founder, team, and customer conversations.
        </p>
      </div>

      {/* Conviction Alignment vs. Market Reality Chart (Figma Screen 2) */}
      <div className="floating-card bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Metric in Focus
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Conviction Alignment vs. Market Reality
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded-full bg-indigo-600"></span>
              <span className="text-slate-700">Internal Conviction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded-full bg-amber-500"></span>
              <span className="text-slate-700">Market Reception</span>
            </div>
          </div>
        </div>

        {/* Dual-Wave SVG Chart with Key Inflection Node */}
        <div className="relative pt-6 pb-2">
          {/* Inflection Tooltip Badge */}
          <div className="absolute top-2 left-[51%] -translate-x-1/2 z-10 bg-white/95 backdrop-blur-xs border border-amber-300 shadow-md rounded-xl px-3 py-1.5 text-center flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <div className="text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                Key Inflection · Jul 28
              </div>
              <div className="text-xs font-bold text-slate-900">
                Product Pivot Announcement
              </div>
            </div>
            <span className="text-indigo-600 text-xs">🎯</span>
          </div>

          {/* SVG Wave Visualization */}
          <div className="w-full h-56 sm:h-64">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 700 220"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Purple Wave Gradient */}
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>

                {/* Orange Wave Gradient */}
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="700" y2="110" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="0" y1="170" x2="700" y2="170" stroke="#F1F5F9" strokeDasharray="3 3" />

              {/* Vertical Inflection Guide Line at July (x=350) */}
              <line
                x1="350"
                y1="50"
                x2="350"
                y2="200"
                stroke="#FCD34D"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Filled Wave 1: Purple (Internal Conviction) */}
              <path
                d="M 0 170 C 150 160, 250 80, 350 120 C 450 160, 550 50, 700 40 L 700 220 L 0 220 Z"
                fill="url(#purpleGradient)"
              />

              {/* Filled Wave 2: Orange (Market Reception) */}
              <path
                d="M 0 180 C 120 180, 220 150, 350 120 C 480 90, 580 70, 700 60 L 700 220 L 0 220 Z"
                fill="url(#orangeGradient)"
              />

              {/* Stroke Wave 1: Purple (Internal Conviction) */}
              <path
                d="M 0 170 C 150 160, 250 80, 350 120 C 450 160, 550 50, 700 40"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Stroke Wave 2: Orange (Market Reception) */}
              <path
                d="M 0 180 C 120 180, 220 150, 350 120 C 480 90, 580 70, 700 60"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Intersection / Key Inflection Point Circle (x=350, y=120) */}
              <circle cx="350" cy="120" r="7" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="350" cy="120" r="11" fill="none" stroke="#F59E0B" strokeWidth="2" />
            </svg>
          </div>

          {/* X-Axis Months (Figma Screen 2) */}
          <div className="flex justify-between text-xs font-semibold text-slate-400 px-4 pt-3 border-t border-slate-100">
            <span>May</span>
            <span>Jun</span>
            <span className="font-bold text-slate-700">Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
          </div>
        </div>
      </div>

      {/* 3 Real-time Pulse Cards (Figma Screen 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {/* Card 1: Buyer Intent */}
        <div className="floating-card bg-white rounded-3xl border border-slate-200/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Buyer Intent
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-bold text-slate-900">
                Customer Urgency: +18%
              </span>
            </div>
          </div>
          <span className="text-slate-400 text-lg font-bold">↗</span>
        </div>

        {/* Card 2: Leadership Pulse */}
        <div className="floating-card bg-white rounded-3xl border border-slate-200/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Leadership Pulse
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-bold text-slate-900">
                Internal Alignment: 84%
              </span>
            </div>
          </div>
          <span className="text-indigo-600 text-lg font-bold">✓</span>
        </div>

        {/* Card 3: Contradiction Signal */}
        <div className="floating-card animate-float-subtle bg-amber-50/50 rounded-3xl border border-amber-200/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">
              Contradiction Signal
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-base sm:text-lg font-bold text-amber-950">
                Pricing Friction: Caution
              </span>
            </div>
          </div>
          <span className="text-amber-600 text-lg font-bold">⚠️</span>
        </div>
      </div>

      {/* Advisor Observation Box (Figma Screen 2) */}
      <div className="floating-card bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white rounded-3xl border border-indigo-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="text-2xl mt-0.5">💡</span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900 mb-1">
              Advisor Observation
            </h4>
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-3xl">
              Conviction surged post-pivot while market acceptance is steadily catching up. However, qualitative notes show 32% of tier-1 trial accounts flagged enterprise seat tiers as overly rigid.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowVerbatims(!showVerbatims)}
          className="bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-indigo-200 shadow-xs whitespace-nowrap transition-colors"
        >
          {showVerbatims ? 'Hide Verbatims' : 'Examine Verbatims'}
        </button>
      </div>

      {/* Verbatims Drawer Modal */}
      {showVerbatims && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Customer & Team Voice Verbatims (Signal Evidence)
            </h4>
            <span className="text-xs text-slate-400">3 Verified Excerpts</span>
          </div>

          <div className="space-y-3">
            {VERBATIMS.map((v, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                  &ldquo;{v.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-medium">
                  <span>— {v.source}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-bold">
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
