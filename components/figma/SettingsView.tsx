'use client';

import React, { useState, useEffect } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { FIXED_WORKSPACE_ID } from '@/lib/types';

export function SettingsView() {
  const { resetAll } = useFounderSync();

  const [geminiKey, setGeminiKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.6-flash');
  const [grokModel, setGrokModel] = useState('openai/gpt-oss-120b');

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGrokKey, setShowGrokKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Load configuration from API and LocalStorage on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data?.config) {
            if (data.config.geminiKey) setGeminiKey(data.config.geminiKey);
            if (data.config.grokKey) setGrokKey(data.config.grokKey);
            if (data.config.geminiModel) setGeminiModel(data.config.geminiModel);
            if (data.config.grokModel) setGrokModel(data.config.grokModel);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load server settings, checking localStorage', err);
      }

      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const storedGemini = localStorage.getItem('foundersync_gemini_key');
        const storedGrok = localStorage.getItem('foundersync_grok_key');
        const storedGeminiModel = localStorage.getItem('foundersync_gemini_model');
        const storedGrokModel = localStorage.getItem('foundersync_grok_model');

        if (storedGemini) setGeminiKey(storedGemini);
        if (storedGrok) setGrokKey(storedGrok);
        if (storedGeminiModel) setGeminiModel(storedGeminiModel);
        if (storedGrokModel) setGrokModel(storedGrokModel);
      }
    }

    loadConfig();
  }, []);

  // Save Configuration Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccessMsg(null);
    setSaveErrorMsg(null);
    setTestResult(null);

    const cleanGemini = geminiKey.trim();
    const cleanGrok = grokKey.trim();

    try {
      // 1. Save to server .env.local and active process.env
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiKey: cleanGemini,
          grokKey: cleanGrok,
          geminiModel,
          grokModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server rejected configuration update.');
      }

      // 2. Persist in localStorage for client components
      if (typeof window !== 'undefined') {
        localStorage.setItem('foundersync_gemini_key', cleanGemini);
        localStorage.setItem('foundersync_grok_key', cleanGrok);
        localStorage.setItem('foundersync_gemini_model', geminiModel);
        localStorage.setItem('foundersync_grok_model', grokModel);
      }

      setSavedSuccessMsg(
        'Configuration saved successfully! Keys are permanently stored in .env.local and active across the runtime engine.'
      );
      setTimeout(() => setSavedSuccessMsg(null), 6000);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Test Connection Handler
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/reality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: 'Test dual AI connectivity for FounderSync operating system',
          geminiKey: geminiKey.trim(),
          grokKey: grokKey.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'API call failed');
      }

      const isSimulated = data.simulated || data.aiData?.simulated;
      if (isSimulated) {
        setTestResult({
          success: true,
          message: 'Endpoint responded with simulated fallback. Check your keys or rate limits.',
          details: `Model: ${data.aiData?.model || 'simulated'}`,
        });
      } else {
        setTestResult({
          success: true,
          message: '✓ Both Google Gemini & Groq connected and validated successfully!',
          details: `Active model: ${data.aiData?.model || 'Gemini + Groq live'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Connection test failed: ' + (err.message || 'Network error'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-widest text-indigo-600 font-bold">
          Platform Configuration
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Settings & Model Governance
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage Dual-AI engine configurations, Google AI Studio & Groq credentials, workspace scopes, and security settings.
        </p>
      </div>

      {/* Success Alert */}
      {savedSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm text-emerald-800 font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
          <span className="text-lg">✓</span>
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {saveErrorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs sm:text-sm text-rose-800 font-semibold flex items-center gap-3 shadow-sm">
          <span className="text-lg">⚠️</span>
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Test Connection Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex flex-col gap-1 border shadow-sm ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{testResult.success ? '🟢' : '🔴'}</span>
            <span>{testResult.message}</span>
          </div>
          {testResult.details && (
            <span className="text-[11px] text-slate-600 pl-6 font-mono">{testResult.details}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dual AI Engine Architecture */}
        <div className="floating-card bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🤖</span> Dual-AI Engine Architecture
            </h3>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Industry 6.0 Engine
            </span>
          </div>

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
                <option value="gemini-3.6-flash">gemini-3.6-flash (Active High-Speed Model)</option>
                <option value="gemini-3.5-flash">gemini-3.5-flash (High speed fallback)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra lightweight)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Standard legacy)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Acts as Strategic Mirror synthesizing hard Growth metrics with Human signals.
              </p>
            </div>

            {/* Grok Contradictory Advisor */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Groq / Grok Contradictory Advisor Model:
              </label>
              <select
                value={grokModel}
                onChange={(e) => setGrokModel(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Active Groq Model)</option>
                <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Fast Groq Inference)</option>
                <option value="grok-beta">grok-beta (xAI Grok Endpoint)</option>
                <option value="grok-4.5">grok-4.5 (Legacy Grok)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Acts as Contradictory Advisor generating adversarial reality checks and exposing blind spots.
              </p>
            </div>
          </div>
        </div>

        {/* API Credentials Management */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🔑</span> API Credentials Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keys saved here are stored directly into <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-slate-800 font-mono">.env.local</code> and synced immediately in memory.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Permanent Sync Enabled
            </span>
          </div>

          <div className="space-y-5">
            {/* Google AI Studio / Gemini Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Google AI Studio / Gemini Key:
                </label>
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showGeminiKey ? 'Hide' : 'Reveal'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AQ.Ab8... or AIzaSy..."
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-20"
                />
                {geminiKey && (
                  <button
                    type="button"
                    onClick={() => setGeminiKey('')}
                    className="absolute right-2 top-2 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-1 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Supports Google AI Studio keys (<code className="font-mono text-slate-700">AQ.Ab8...</code>) or Standard Gemini API Keys (<code className="font-mono text-slate-700">AIzaSy...</code>).
              </p>
            </div>

            {/* Groq / Grok API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Groq / Grok API Key:
                </label>
                <button
                  type="button"
                  onClick={() => setShowGrokKey(!showGrokKey)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showGrokKey ? 'Hide' : 'Reveal'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showGrokKey ? 'text' : 'password'}
                  value={grokKey}
                  onChange={(e) => setGrokKey(e.target.value)}
                  placeholder="gsk_... or xai-..."
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-20"
                />
                {grokKey && (
                  <button
                    type="button"
                    onClick={() => setGrokKey('')}
                    className="absolute right-2 top-2 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-1 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Supports high-speed Groq keys (<code className="font-mono text-slate-700">gsk_...</code>) and xAI Grok keys (<code className="font-mono text-slate-700">xai-...</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Workspace & Security Governance */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🛡️</span> Workspace & RLS Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-500 block">Single-Tenant Workspace ID:</span>
              <code className="text-indigo-700 font-mono text-[11px] break-all">{FIXED_WORKSPACE_ID}</code>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-500 block">Row-Level Security (RLS):</span>
              <span className="text-emerald-700 font-bold">Enabled & Scoped to Workspace</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-300 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <span className="animate-spin text-sm">⏳</span> Testing...
                </>
              ) : (
                <>
                  <span>⚡</span> Test Connection
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin text-sm">⏳</span> Saving...
                </>
              ) : (
                <>
                  <span>💾</span> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
