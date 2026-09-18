'use client';

import React from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { HeatmapScore } from '@/types';
import { ImbalanceAlert } from './ImbalanceAlert';

export function EchoChamberHeatmap() {
  const { state, imbalanceResult } = useFounderSync();
  const { heatmapScores } = state;

  const quadrants: Array<{
    key: keyof HeatmapScore;
    label: string;
    description: string;
    score: number;
    colorClasses: { bg: string; text: string; border: string; bar: string };
  }> = [
    {
      key: 'marketFeasibility',
      label: 'Market Feasibility',
      description: 'Demand validation, TAM penetration, competitive resilience',
      score: heatmapScores.marketFeasibility,
      colorClasses: {
        bg: 'bg-blue-50/60',
        text: 'text-blue-900',
        border: 'border-blue-200',
        bar: 'bg-blue-500',
      },
    },
    {
      key: 'teamSustainability',
      label: 'Team Sustainability',
      description: 'Burnout resistance, psychological safety, talent retention',
      score: heatmapScores.teamSustainability,
      colorClasses: {
        bg: 'bg-emerald-50/60',
        text: 'text-emerald-900',
        border: 'border-emerald-200',
        bar: 'bg-emerald-500',
      },
    },
    {
      key: 'unitEconomics',
      label: 'Unit Economics',
      description: 'LTV/CAC ratio, gross margins, payback velocity, runway buffer',
      score: heatmapScores.unitEconomics,
      colorClasses: {
        bg: 'bg-indigo-50/60',
        text: 'text-indigo-900',
        border: 'border-indigo-200',
        bar: 'bg-indigo-500',
      },
    },
    {
      key: 'customerValue',
      label: 'Customer Value',
      description: 'Net promoter trust, retention sentiment, product stickiness',
      score: heatmapScores.customerValue,
      colorClasses: {
        bg: 'bg-purple-50/60',
        text: 'text-purple-900',
        border: 'border-purple-200',
        bar: 'bg-purple-500',
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module 4 Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
          Module 04 · Blind Spot Matrix
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Echo-Chamber Heatmap
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Quantifies systemic alignment across 4 critical startup vectors (0-100). Highlights dangerous confirmation bias when teams over-index on growth while starving sustainability.
        </p>
      </div>

      {/* Imbalance Alert Banner */}
      <ImbalanceAlert imbalance={imbalanceResult} />

      {/* 4 Quadrants Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quadrants.map((q) => {
          const isNeglected = imbalanceResult.isImbalanced && imbalanceResult.neglectedQuadrant === q.key;
          const isHighest = imbalanceResult.maxQuadrant === q.key;

          return (
            <div
              key={q.key}
              className={`rounded-xl border p-5 transition-all relative ${
                isNeglected
                  ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-300'
                  : `${q.colorClasses.border} ${q.colorClasses.bg}`
              }`}
            >
              {/* Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {q.label}
                </span>

                <div className="flex items-center gap-1.5">
                  {isNeglected && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-800">
                      ⚠️ Neglected
                    </span>
                  )}
                  {isHighest && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Dominant
                    </span>
                  )}
                  <span
                    className={`text-xl font-black ${
                      q.score >= 70
                        ? 'text-emerald-700'
                        : q.score >= 50
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {q.score}
                    <span className="text-xs font-normal text-slate-500">/100</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4">{q.description}</p>

              {/* Progress Bar */}
              <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    q.score < 50
                      ? 'bg-rose-500'
                      : q.score < 70
                      ? 'bg-amber-500'
                      : q.colorClasses.bar
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, q.score))}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
