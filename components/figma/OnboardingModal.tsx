'use client';

import React, { useState } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [email, setEmail] = useState('founder@venture.co');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-linear-to-b from-white to-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header Branding */}
        <div className="text-center space-y-3 pt-2">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-100 mb-1">
            <span className="font-black text-indigo-600 text-lg">FS</span>
          </div>

          {/* Dialectical Co-Pilot Pill Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              <span>🗣️</span>
              <span>Dialectical Co-Pilot</span>
            </span>
          </div>

          {/* Title & Tagline (Figma Screen 1) */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Your strategic mirror, <br />
            <span className="text-indigo-600">not your autopilot.</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Challenge assumptions, uncover blind spots, and lead with conviction.
          </p>
        </div>

        {/* Auth Form Box (Figma Screen 1) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          {/* Email Input & Password / Magic Link */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue with Magic Link</span>
              <span>→</span>
            </button>
          </div>

          {/* Guarantees */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Zero vanity metrics
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              End-to-end confidential
            </span>
          </div>
        </div>

        {/* Terms */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          By signing in, you agree to our <span className="underline cursor-pointer">Terms of Deliberation</span> and <span className="underline cursor-pointer">Privacy Framework</span>.
        </p>

        {/* Testimonial Quote Banner (Figma Screen 1) */}
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-3 text-xs text-indigo-950">
          <span className="text-base">💡</span>
          <p className="italic font-medium leading-relaxed">
            &ldquo;A critical sounding board ready before today&apos;s term sheet negotiations.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
