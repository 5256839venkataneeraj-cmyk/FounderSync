'use client';

import React from 'react';
import { RealityCheckResult } from '@/types';

interface AdvisorOutputProps {
  result: RealityCheckResult;
}

export function AdvisorOutput({ result }: AdvisorOutputProps) {
  const {
    strategyEvaluated,
    counterarguments = [],
    blindSpots = [],
    verdict,
    model,
    simulated,
    generatedAt,
  } = result;

  const verdictConfig = {
    reconsider: {
      label: 'RECONSIDER STRATEGY',
      description: 'Severe structural hazards, potential customer alienation, or unsustainable team fatigue detected.',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
      bannerClass: 'bg-rose-950/50 border-rose-800/80 text-rose-200',
      icon: '🛑',
    },
    proceed_with_caution: {
      label: 'PROCEED WITH CAUTION',
      description: 'Execution friction expected. Mandate phased milestones, customer guardrails, and explicit kill criteria.',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
      bannerClass: 'bg-amber-950/50 border-amber-800/80 text-amber-200',
      icon: '⚠️',
    },
    proceed: {
      label: 'PROCEED AS DESIGNED',
      description: 'Defensible trajectory with manageable risks. Monitor leading sustainability metrics during rollout.',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      bannerClass: 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200',
      icon: '✅',
    },
  }[verdict || 'reconsider'] || {
    label: 'EVALUATION PENDING',
    description: 'Review the counterarguments below.',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    bannerClass: 'bg-slate-800/50 border-slate-700 text-slate-200',
    icon: '⚡',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 shadow-md space-y-6">
      {/* Top Banner: Score & Engine Mode Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-rose-400 font-bold text-base flex items-center gap-1.5">
            <span>⚡</span> Contradictory Reality-Check Critique
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Engine Mode Badge */}
          {simulated ? (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Deterministic Simulation Mode
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Live Grok (xAI) Devil’s Advocate
            </span>
          )}

          {model && (
            <span className="text-[11px] text-slate-400 font-mono">
              [{model}]
            </span>
          )}
        </div>
      </div>

      {/* Evaluated Strategy Prompt */}
      {strategyEvaluated && (
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-lg p-3.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Strategy Under Cross-Examination:
          </span>
          <p className="text-sm text-slate-200 italic font-medium">
            &quot;{strategyEvaluated}&quot;
          </p>
        </div>
      )}

      {/* Verdict Alert Banner */}
      <div className={`border rounded-lg p-4 flex items-start gap-3.5 ${verdictConfig.bannerClass}`}>
        <span className="text-2xl mt-0.5">{verdictConfig.icon}</span>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Adversarial Verdict:
            </span>
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${verdictConfig.badgeClass}`}>
              {verdictConfig.label}
            </span>
          </div>
          <p className="text-xs font-normal leading-relaxed opacity-90">
            {verdictConfig.description}
          </p>
        </div>
      </div>

      {/* 1. Adversarial Counterarguments */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-semibold text-rose-400 mb-2.5 flex items-center gap-1.5">
          <span>⚔️</span> Structural & Commercial Counterarguments
        </h4>
        <ul className="space-y-2">
          {counterarguments.map((arg, idx) => (
            <li
              key={idx}
              className="text-sm bg-slate-800/70 border border-slate-750 text-slate-200 rounded-lg p-3.5 flex items-start gap-2.5"
            >
              <span className="text-rose-400 font-bold text-xs mt-0.5">0{idx + 1}.</span>
              <span className="leading-relaxed font-normal text-slate-300">{arg}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Surfaced Blind Spots */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2.5 flex items-center gap-1.5">
          <span>🎯</span> Unaddressed Blind Spots & Vulnerabilities
        </h4>
        <ul className="space-y-2">
          {blindSpots.map((spot, idx) => (
            <li
              key={idx}
              className="text-sm bg-slate-800/70 border border-slate-750 text-slate-200 rounded-lg p-3.5 flex items-start gap-2.5"
            >
              <span className="text-amber-400 font-bold text-xs mt-0.5">0{idx + 1}.</span>
              <span className="leading-relaxed font-normal text-slate-300">{spot}</span>
            </li>
          ))}
        </ul>
      </div>

      {generatedAt && (
        <div className="text-right text-[11px] text-slate-500 font-mono">
          Generated: {new Date(generatedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
