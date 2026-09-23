'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useFounderSync } from '@/context/FounderSyncContext';

export function MetricsGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, healthScore } = useFounderSync();
  const { growthMetrics, humanMetrics } = state;
  const { growthDetails, humanDetails } = healthScore;

  useGSAP(
    () => {
      gsap.fromTo(
        '.gsap-card',
        { opacity: 0, y: 40 },
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
    <div ref={containerRef} className="space-y-6">
      {/* Module 1: Growth Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hard Growth Metrics (50% Weight)
          </h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 dark:border dark:border-blue-500/20">
            Subscore: {healthScore.growthScoreNormalized}/100
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* ARR */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Annual Recurring Revenue</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              ${(growthMetrics.arr / 1000000).toFixed(2)}M
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span>Norm: {growthDetails.arr.normalized}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">30% wt</span>
            </div>
          </div>

          {/* Monthly Churn Rate */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Monthly Churn Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              {growthMetrics.churnRate.toFixed(1)}%
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span>Norm: {growthDetails.churnRate.normalized}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">30% wt</span>
            </div>
          </div>

          {/* LTV */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Customer Lifetime Value</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              ${growthMetrics.ltv.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span>Norm: {growthDetails.ltv.normalized}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">20% wt</span>
            </div>
          </div>

          {/* Monthly Burn Rate */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Monthly Burn Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              ${growthMetrics.burnRate.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span>Norm: {growthDetails.burnRate.normalized}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">20% wt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 1: Human Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Human-Centric & Sustainability Signals (50% Weight)
          </h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 dark:border dark:border-emerald-500/20">
            Subscore: {healthScore.humanScoreNormalized}/100
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Team Burnout Index */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Team Burnout Index</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              {humanMetrics.burnoutIndex}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span className={humanMetrics.burnoutIndex > 65 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                Norm: {humanDetails.burnoutIndex.normalized}/100
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">30% wt</span>
            </div>
          </div>

          {/* Customer Trust Score */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Customer Trust Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              {humanMetrics.customerTrustScore}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span>Norm: {humanDetails.customerTrustScore.normalized}/100</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">30% wt</span>
            </div>
          </div>

          {/* Founder Cognitive Load */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Founder Cognitive Load</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              {humanMetrics.founderCognitiveLoad}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span className={humanMetrics.founderCognitiveLoad > 70 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                Norm: {humanDetails.founderCognitiveLoad.normalized}/100
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">20% wt</span>
            </div>
          </div>

          {/* Retention Sentiment */}
          <div className="gsap-card bg-white dark:bg-[#1A1A22] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Retention Sentiment</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F1F1F5] mt-1">
              {humanMetrics.retentionSentiment}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal flex justify-between">
              <span>Norm: {humanDetails.retentionSentiment.normalized}/100</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">20% wt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
