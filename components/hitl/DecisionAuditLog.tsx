'use client';

import React from 'react';
import { Decision } from '@/types';

interface DecisionAuditLogProps {
  decisions: Decision[];
}

export function DecisionAuditLog({ decisions }: DecisionAuditLogProps) {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500 font-medium">No decisions recorded yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Decisions made after reviewing AI Reality-Checks will appear here with full human justification logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Decision Audit Log ({decisions.length} Logged)
        </h3>
        <span className="text-xs text-slate-500">Persisted in Supabase & Local DAL</span>
      </div>

      <div className="space-y-3">
        {decisions.map((decision) => {
          const isPivot = decision.action === 'PIVOT_STRATEGY';
          const rawDate = decision.created_at || (decision as any).timestamp || new Date().toISOString();
          const dateStr = new Date(rawDate).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const realityCheck = decision.reality_checks || (decision as any).realityCheckResult;
          const strategyText =
            realityCheck?.strategyEvaluated ||
            (realityCheck as any)?.input_text ||
            (decision as any).strategyInput ||
            'Strategic Proposal';

          const counterArg =
            realityCheck?.counterarguments?.[0] ||
            (realityCheck as any)?.opposingStrategy ||
            (realityCheck as any)?.opposing_strategy;

          const blindSpot =
            realityCheck?.blindSpots?.[0] ||
            (realityCheck as any)?.blind_spots?.[0];

          return (
            <div
              key={decision.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
            >
              {/* Header: Action Badge & Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isPivot
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {isPivot ? '↺ Pivoted Strategy (Heeded Grok)' : '⚠️ Accepted & Overrode Grok'}
                  </span>
                  <span className="text-xs text-slate-400">ID: {decision.id.slice(0, 14)}</span>
                </div>
                <span className="text-xs text-slate-500">{dateStr}</span>
              </div>

              {/* Strategy Evaluated */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Original Strategy Proposition:
                </div>
                <p className="text-sm text-slate-900 font-medium mt-0.5">
                  &quot;{strategyText}&quot;
                </p>
              </div>

              {/* AI Reality Check Summary */}
              {realityCheck && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Grok Contradictory Advisor Cross-Examination:</span>
                    {realityCheck.verdict && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        Verdict: {realityCheck.verdict.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  {counterArg && (
                    <p className="text-slate-700 italic">
                      &quot;{counterArg}&quot;
                    </p>
                  )}
                  {blindSpot && (
                    <div className="pt-1 text-slate-600">
                      <span className="font-semibold text-rose-600">Key Blindspot: </span>
                      <span>{blindSpot}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Founder Justification (Mandatory HITL requirement) */}
              <div className="pt-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Logged Founder Justification:
                </div>
                <p className="text-sm text-slate-800 mt-1 pl-3 border-l-2 border-indigo-400 bg-indigo-50/40 py-1.5 rounded-r">
                  {decision.justification}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
