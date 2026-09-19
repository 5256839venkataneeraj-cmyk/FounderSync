'use client';

import React from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { MetricsGrid } from './MetricsGrid';
import { StrategicAnalyst } from './StrategicAnalyst';

export function StrategicMirror() {
  const { state, healthScore } = useFounderSync();
  const { timeSeries } = state;

  return (
    <div className="space-y-8">
      {/* Top Banner: Startup Health Score & Core Formula */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
              Strategic Mirror · Industry 6.0 Core
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Startup Health Score</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Composite score balancing 50% normalized Growth metrics (ARR, Churn, LTV, Burn) against 50% normalized Human-Centric signals (Team Burnout, Trust, Cognitive Load, Retention).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 px-6 py-4 rounded-xl border border-slate-700">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Composite Score</div>
              <div className="text-xs text-slate-500">50% Growth + 50% Human</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black ${
                healthScore.compositeScore >= 70
                  ? 'text-emerald-400'
                  : healthScore.compositeScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {healthScore.compositeScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
          </div>
        </div>

        {/* Formula Breakdown Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
            <div className="text-xs">
              <span className="text-blue-400 font-semibold">Growth Dimension (50%): </span>
              <span className="text-slate-300">Normalized ARR, Churn, LTV, Burn Rate</span>
            </div>
            <span className="text-sm font-bold text-blue-400 ml-2">
              {healthScore.growthScoreNormalized}/100
            </span>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
            <div className="text-xs">
              <span className="text-emerald-400 font-semibold">Human Dimension (50%): </span>
              <span className="text-slate-300">Burnout, Trust, Cognitive Load, Retention</span>
            </div>
            <span className="text-sm font-bold text-emerald-400 ml-2">
              {healthScore.humanScoreNormalized}/100
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <MetricsGrid />

      {/* 12-Month Seeded Time-Series: Revenue Growth vs Team Wellness */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              12-Month Trend: Revenue Growth vs Team Wellness
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing the tension between top-line expansion and human sustainability over time.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
              <span className="text-slate-700">Monthly Revenue Growth %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
              <span className="text-slate-700">Team Wellness Index (0-100)</span>
            </div>
          </div>
        </div>

        {/* Time-Series Chart / Visual Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Revenue Growth (%)</th>
                <th className="py-2.5 px-3">Team Wellness (0-100)</th>
                <th className="py-2.5 px-3 min-w-[200px]">Tension Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeSeries.map((pt) => {
                const growthPct = Math.min(100, Math.max(0, pt.revenueGrowth * 4));
                const wellnessPct = pt.teamWellnessIndex;
                const isUnderPressure = pt.revenueGrowth > 15 && pt.teamWellnessIndex < 55;

                return (
                  <tr key={pt.month} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{pt.month}</td>
                    <td className="py-2.5 px-3 text-blue-600 font-semibold">
                      +{pt.revenueGrowth.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-semibold ${
                        pt.teamWellnessIndex >= 70
                          ? 'text-emerald-600'
                          : pt.teamWellnessIndex >= 50
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {pt.teamWellnessIndex}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-12">Growth</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${growthPct}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-12">Wellness</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pt.teamWellnessIndex >= 70
                                  ? 'bg-emerald-500'
                                  : pt.teamWellnessIndex >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${wellnessPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {isUnderPressure && (
                        <span className="text-[10px] font-semibold text-rose-600 inline-block mt-1">
                          ⚠️ Growth cannibalizing team wellness
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gemini Strategic Analyst Module */}
      <StrategicAnalyst />
    </div>
  );
}
