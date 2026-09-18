'use client';

import React from 'react';
import { ImbalanceResult } from '@/types';

interface ImbalanceAlertProps {
  imbalance: ImbalanceResult;
}

export function ImbalanceAlert({ imbalance }: ImbalanceAlertProps) {
  const { isImbalanced, neglectedQuadrantLabel, delta, maxScore, minScore } = imbalance;

  if (!isImbalanced) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
        <span className="text-emerald-600 font-bold text-base mt-0.5">✓</span>
        <div>
          <span className="font-bold text-sm block text-emerald-800">
            Balanced Startup Topology (Delta: {delta} pts ≤ 30)
          </span>
          <p className="mt-0.5 text-emerald-700">
            Your startup is maintaining healthy equilibrium between market ambition, unit economics, and team/customer sustainability.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 shadow-sm flex items-start gap-3.5">
      <span className="text-rose-600 font-black text-xl mt-0.5">⚠️</span>
      <div className="space-y-1.5 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="font-bold text-sm text-rose-950">
            Echo-Chamber Alert: Quadrant Over-Indexing Detected!
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-200 text-rose-900 w-fit">
            Delta: {delta} pts (Threshold: &gt;30)
          </span>
        </div>

        <p className="text-xs text-rose-800 leading-relaxed">
          Critical imbalance identified between high-scoring areas ({maxScore} pts) and the neglected quadrant:{' '}
          <strong className="font-bold underline text-rose-950">
            {neglectedQuadrantLabel} ({minScore} pts)
          </strong>.
        </p>

        <p className="text-[11px] text-rose-700/90 italic">
          Recommendation: Run a Reality-Check focused specifically on bolstering {neglectedQuadrantLabel} to prevent systemic startup failure.
        </p>
      </div>
    </div>
  );
}
