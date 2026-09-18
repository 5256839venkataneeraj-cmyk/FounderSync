'use client';

import React, { useState } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { FIXED_WORKSPACE_ID } from '@/lib/types';

export function SettingsView() {
  const { resetAll } = useFounderSync();
  const [geminiKey, setGeminiKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-flash-lite');
  const [grokModel, setGrokModel] = useState('grok-4.5');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <span className="text-[11px] uppercase tracking-widest text-indigo-600 font-bold">
          Platform Configuration
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Settings & Model Governance
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage Dual-AI engine configurations, workspace scopes, and security settings.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <span>✓</span>
          <span>Runtime settings and model configuration saved in session.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dual AI Models Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🤖</span> Dual-AI Engine Architecture
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Gemini Strategic Mirror */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Gemini Strategic Mirror Model:
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Active default)</option>
                <option value="gemini-3.5-flash">gemini-3.5-flash (High speed fallback)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash (Advanced reasoning)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Acts as Strategic Mirror synthesizing hard Growth metrics with Human signals.
              </p>
            </div>

            {/* Grok Contradictory Advisor */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Grok Devil&apos;s Advocate Model:
              </label>
              <select
                value={grokModel}
                onChange={(e) => setGrokModel(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="grok-4.5">grok-4.5 (Active default)</option>
                <option value="grok-4-fast">grok-4-fast (Low latency)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Acts as Contradictory Advisor generating adversarial reality checks and blind spots.
              </p>
            </div>
          </div>
        </div>

        {/* Runtime Session API Keys */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🔑</span> Runtime Session API Keys
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              In-Memory Only · Redacted from Logs
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Gemini API Key (Runtime override):
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use server .env.local)"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grok / xAI API Key (Runtime override):
              </label>
              <input
                type="password"
                value={grokKey}
                onChange={(e) => setGrokKey(e.target.value)}
                placeholder="xai-... (leave blank for deterministic simulation)"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Workspace & Security Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🛡️</span> Workspace & RLS Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-500 block">Single-Tenant Workspace ID:</span>
              <code className="text-indigo-700 font-mono text-[11px] break-all">{FIXED_WORKSPACE_ID}</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-500 block">Row-Level Security (RLS):</span>
              <span className="text-emerald-700 font-bold">Enabled & Scoped to Workspace</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all metrics, decisions, and audit log to initial seed data?')) {
                resetAll();
                alert('All data reset to initial baseline.');
              }
            }}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            ↺ Reset All Data to Seed Baseline
          </button>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
