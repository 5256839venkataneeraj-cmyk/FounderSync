'use client';

import React, { useState } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { DecisionAction } from '@/types';
import { DecisionAuditLog } from './DecisionAuditLog';

export function DecisionHub() {
  const { state, activeCritique, activeStrategy, recordDecision } = useFounderSync();
  const [selectedAction, setSelectedAction] = useState<DecisionAction>('PIVOT_STRATEGY');
  const [justification, setJustification] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const charCount = justification.trim().length;
  const isJustificationValid = charCount >= 20;

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSaveSuccessMsg(null);

    if (!activeCritique) {
      setValidationError('You must run a Reality-Check first before recording a decision.');
      return;
    }

    if (!isJustificationValid) {
      setValidationError(`Justification must be at least 20 characters (current: ${charCount}). Explain your rationale clearly.`);
      return;
    }

    const result = recordDecision(selectedAction, justification);
    if (result.success) {
      setJustification('');
      setSaveSuccessMsg('Decision successfully verified, signed by founder, and appended to the Audit Log.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } else {
      setValidationError(result.error || 'Failed to save decision.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Module 3 Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
          Module 03 · Human-in-the-Loop Decision Hub
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Executive Review & Justification Gate
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          FounderSync enforces Industry 5.0 Human-Centric autonomy: AI suggestions are never auto-executed. Every decision requires explicit founder review and logged justification.
        </p>
      </div>

      {/* Active Decision Gate Card */}
      {activeCritique ? (
        <div className="bg-white rounded-xl border-2 border-indigo-500/30 p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Action Required
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Evaluate AI Reality-Check for: &quot;{activeStrategy}&quot;
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Step 2 of 2</span>
          </div>

          <form onSubmit={handleSaveDecision} className="space-y-5">
            {/* Action Selection Radios */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Choose Executive Action:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAction === 'PIVOT_STRATEGY'
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision-action"
                      value="PIVOT_STRATEGY"
                      checked={selectedAction === 'PIVOT_STRATEGY'}
                      onChange={() => setSelectedAction('PIVOT_STRATEGY')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-sm text-slate-900">
                      Pivot Strategy (Heed Grok Advisor)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 pl-5">
                    Accept the contradictory advisor&apos;s blind spots and adopt a safer, sustainable alternative.
                  </p>
                </label>

                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAction === 'ACCEPT_AND_OVERRIDE_AI'
                      ? 'border-amber-500 bg-amber-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision-action"
                      value="ACCEPT_AND_OVERRIDE_AI"
                      checked={selectedAction === 'ACCEPT_AND_OVERRIDE_AI'}
                      onChange={() => setSelectedAction('ACCEPT_AND_OVERRIDE_AI')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-bold text-sm text-slate-900">
                      Accept & Override Grok
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 pl-5">
                    Acknowledge the identified risks but proceed anyway based on strategic domain context.
                  </p>
                </label>
              </div>
            </div>

            {/* Mandatory Justification Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="justification-input" className="text-xs font-semibold text-slate-700">
                  Logged Founder Justification (Mandatory, min 20 characters):
                </label>
                <span
                  className={`text-xs font-medium ${
                    isJustificationValid ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {charCount} / 20 min chars
                </span>
              </div>
              <textarea
                id="justification-input"
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain why you chose this path, how team burnout will be mitigated, or why you are overriding the AI's critique..."
                className={`w-full text-sm border rounded-lg p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  validationError
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {!isJustificationValid && charCount > 0 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Need {20 - charCount} more character{20 - charCount === 1 ? '' : 's'} to meet audit compliance.
                </p>
              )}
            </div>

            {/* Validation Feedback */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {validationError}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isJustificationValid}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Sign & Commit to Audit Log
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No active Reality-Check under review.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Submit a strategy in Module 02 above to generate a devil&apos;s advocate critique, then verify and sign your decision here.
          </p>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center justify-between">
          <span>✓ {saveSuccessMsg}</span>
        </div>
      )}

      {/* Persisted Audit Log */}
      <DecisionAuditLog decisions={state.decisions} />
    </div>
  );
}
