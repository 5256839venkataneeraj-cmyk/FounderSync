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
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Hard Growth Metrics (50% Weight)
          </h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
            Subscore: {healthScore.growthScoreNormalized}/100
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* ARR */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Annual Recurring Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ${(growthMetrics.arr / 1000000).toFixed(2)}M
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span>Norm: {growthDetails.arr.normalized}/100</span>
              <span className="text-blue-600 font-medium">30% wt</span>
            </div>
          </div>

          {/* Monthly Churn Rate */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Monthly Churn Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {growthMetrics.churnRate.toFixed(1)}%
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span>Norm: {growthDetails.churnRate.normalized}/100</span>
              <span className="text-blue-600 font-medium">30% wt</span>
            </div>
          </div>

          {/* LTV */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Customer Lifetime Value</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ${growthMetrics.ltv.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span>Norm: {growthDetails.ltv.normalized}/100</span>
              <span className="text-blue-600 font-medium">20% wt</span>
            </div>
          </div>

          {/* Monthly Burn Rate */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Monthly Burn Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ${growthMetrics.burnRate.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span>Norm: {growthDetails.burnRate.normalized}/100</span>
              <span className="text-blue-600 font-medium">20% wt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 1: Human Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Human-Centric & Sustainability Signals (50% Weight)
          </h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Subscore: {healthScore.humanScoreNormalized}/100
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Team Burnout Index */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Team Burnout Index</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {humanMetrics.burnoutIndex}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span className={humanMetrics.burnoutIndex > 65 ? 'text-amber-600 font-medium' : ''}>
                Norm: {humanDetails.burnoutIndex.normalized}/100
              </span>
              <span className="text-emerald-600 font-medium">30% wt</span>
            </div>
          </div>

          {/* Customer Trust Score */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Customer Trust Score</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {humanMetrics.customerTrustScore}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span>Norm: {humanDetails.customerTrustScore.normalized}/100</span>
              <span className="text-emerald-600 font-medium">30% wt</span>
            </div>
          </div>

          {/* Founder Cognitive Load */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Founder Cognitive Load</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {humanMetrics.founderCognitiveLoad}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span className={humanMetrics.founderCognitiveLoad > 70 ? 'text-amber-600 font-medium' : ''}>
                Norm: {humanDetails.founderCognitiveLoad.normalized}/100
              </span>
              <span className="text-emerald-600 font-medium">20% wt</span>
            </div>
          </div>

          {/* Retention Sentiment */}
          <div className="gsap-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-normal text-slate-500">Retention Sentiment</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {humanMetrics.retentionSentiment}/100
            </p>
            <div className="mt-2 text-xs text-slate-500 font-normal flex justify-between">
              <span>Norm: {humanDetails.retentionSentiment.normalized}/100</span>
              <span className="text-emerald-600 font-medium">20% wt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
