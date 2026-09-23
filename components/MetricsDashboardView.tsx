'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useFounderSync } from '@/context/FounderSyncContext';

export function MetricsDashboardView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, healthScore } = useFounderSync();
  const { growthMetrics, humanMetrics } = state;
  const { growthDetails, humanDetails } = healthScore;

  // Professional staggered entrance animation using official GSAP React hook
  useGSAP(
    () => {
      gsap.fromTo(
        '.gsap-card',
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Header Banner Card */}
      <div className="gsap-card bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Live Executive Dashboard
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            FounderSync Real-Time Metrics
          </h2>
          <p className="text-sm text-slate-500 max-w-xl">
            Dual-vector telemetry synchronizing hard financial growth against human-centric cognitive indicators.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-200/80">
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Composite Health</div>
            <div className="text-xs text-slate-500">50% Growth · 50% Human</div>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl sm:text-4xl font-black ${
                healthScore.compositeScore >= 70
                  ? 'text-emerald-600'
                  : healthScore.compositeScore >= 50
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {healthScore.compositeScore}
            </span>
            <span className="text-xs font-bold text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Section 1: Hard Growth Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              Hard Growth Metrics (50% Weight)
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
            Subscore: {healthScore.growthScoreNormalized}/100
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card: ARR */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Annual Recurring Revenue</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${(growthMetrics.arr / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Norm: {growthDetails.arr.normalized}/100</span>
              <span className="text-blue-600 font-bold">30% wt</span>
            </div>
          </div>

          {/* Card: Monthly Churn */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Monthly Churn Rate</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {growthMetrics.churnRate.toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Norm: {growthDetails.churnRate.normalized}/100</span>
              <span className="text-blue-600 font-bold">30% wt</span>
            </div>
          </div>

          {/* Card: LTV */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Customer Lifetime Value</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${growthMetrics.ltv.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Norm: {growthDetails.ltv.normalized}/100</span>
              <span className="text-blue-600 font-bold">20% wt</span>
            </div>
          </div>

          {/* Card: Monthly Burn */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Monthly Burn Rate</span>
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${growthMetrics.burnRate.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Norm: {growthDetails.burnRate.normalized}/100</span>
              <span className="text-blue-600 font-bold">20% wt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Human-Centric & Sustainability Signals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              Human-Centric &amp; Sustainability Signals (50% Weight)
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Subscore: {healthScore.humanScoreNormalized}/100
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card: Team Burnout */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Team Burnout Index</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {humanMetrics.burnoutIndex}/100
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className={humanMetrics.burnoutIndex > 65 ? 'text-amber-600 font-bold' : ''}>
                Norm: {humanDetails.burnoutIndex.normalized}/100
              </span>
              <span className="text-emerald-600 font-bold">30% wt</span>
            </div>
          </div>

          {/* Card: Customer Trust */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Customer Trust Score</span>
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {humanMetrics.customerTrustScore}/100
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Norm: {humanDetails.customerTrustScore.normalized}/100</span>
              <span className="text-emerald-600 font-bold">30% wt</span>
            </div>
          </div>

          {/* Card: Founder Cognitive Load */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Founder Cognitive Load</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {humanMetrics.founderCognitiveLoad}/100
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className={humanMetrics.founderCognitiveLoad > 70 ? 'text-amber-600 font-bold' : ''}>
                Norm: {humanDetails.founderCognitiveLoad.normalized}/100
              </span>
              <span className="text-emerald-600 font-bold">20% wt</span>
            </div>
          </div>

          {/* Card: Retention Sentiment */}
          <div className="gsap-card group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Retention Sentiment</span>
              <span className="p-1.5 rounded-lg bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {humanMetrics.retentionSentiment}/100
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Norm: {humanDetails.retentionSentiment.normalized}/100</span>
              <span className="text-emerald-600 font-bold">20% wt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricsDashboardView;
