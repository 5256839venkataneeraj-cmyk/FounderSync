'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#131318] text-[#e4e1e9] font-sans antialiased overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* Ambient Aurora Background */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden -z-10">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vmax] h-[140vmax] rounded-full blur-[80px] opacity-70 animate-spin"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, #0e0e13 0deg, #6f00be 70deg, #1b1b20 120deg, #8083ff 190deg, #ffb95f 240deg, #2f2ebe 300deg, #0e0e13 360deg)',
            animationDuration: '45s',
          }}
        />
        <div className="absolute inset-0 bg-[#131318]/60 backdrop-blur-md" />
      </div>

      <main className="relative z-10 w-full max-w-[760px] flex flex-col items-center text-center py-12">
        {/* Radar / Core Gyroscope Graphic */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-amber-500/20 blur-2xl animate-pulse" />
          <svg
            className="relative w-full h-full transform transition-transform duration-700 hover:rotate-12"
            fill="none"
            viewBox="0 0 240 240"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="text-slate-700/40"
              cx="120"
              cy="120"
              r="106"
              stroke="currentColor"
              strokeDasharray="3 7"
              strokeWidth="1"
            />
            <circle
              className="text-indigo-400/30"
              cx="120"
              cy="120"
              r="82"
              stroke="currentColor"
              strokeDasharray="12 6"
              strokeWidth="1"
            />
            <circle
              className="text-slate-500/40"
              cx="120"
              cy="120"
              r="58"
              stroke="currentColor"
              strokeWidth="1"
            />
            <g className="animate-spin" style={{ animationDuration: '32s' }}>
              <ellipse
                className="text-purple-400/40"
                cx="120"
                cy="120"
                rx="94"
                ry="46"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(-30 120 120)"
              />
              <ellipse
                className="text-amber-400/30"
                cx="120"
                cy="120"
                rx="94"
                ry="46"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(45 120 120)"
              />
            </g>
            <circle cx="120" cy="120" fill="url(#coreGrad)" r="36" />
            <circle cx="120" cy="120" fill="url(#glossGrad)" r="36" style={{ mixBlendMode: 'overlay' }} />
            <circle className="fill-amber-400 animate-ping" cx="156" cy="84" r="5" style={{ animationDuration: '3s' }} />
            <circle className="fill-amber-400" cx="156" cy="84" r="4" />
            <line
              className="text-amber-400/60"
              stroke="currentColor"
              strokeDasharray="2 3"
              strokeWidth="1.5"
              x1="120"
              x2="156"
              y1="120"
              y2="84"
            />
            <circle className="fill-indigo-300" cx="82" cy="154" r="3" />
            <line
              className="text-indigo-400/40"
              stroke="currentColor"
              strokeDasharray="2 2"
              strokeWidth="1"
              x1="120"
              x2="82"
              y1="120"
              y2="154"
            />
            <defs>
              <radialGradient cx="35%" cy="35%" id="coreGrad" r="65%">
                <stop offset="0%" stopColor="#e1e0ff" />
                <stop offset="35%" stopColor="#8083ff" />
                <stop offset="70%" stopColor="#2f2ebe" />
                <stop offset="100%" stopColor="#0e0e13" />
              </radialGradient>
              <linearGradient id="glossGrad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#ffb95f" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-[#0e0e13]/90 backdrop-blur-md shadow-md flex items-center gap-1.5 border border-white/10">
            <span className="font-mono text-[11px] text-amber-400 tracking-widest uppercase">
              Delta: NaN
            </span>
          </div>
        </div>

        {/* Reality Divergence Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2a292f]/70 backdrop-blur-md mb-4 shadow-sm border border-white/5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-[11px] tracking-wider uppercase text-slate-300 font-medium">
            Reality Divergence Detected
          </span>
        </div>

        {/* 404 Headline */}
        <div className="relative mb-2 select-none">
          <h1 className="text-[76px] sm:text-[108px] lg:text-[124px] leading-none tracking-tighter font-extrabold bg-gradient-to-b from-[#e1e0ff] via-[#e4e1e9] to-[#908fa0] bg-clip-text text-transparent opacity-95">
            404
          </h1>
          <div className="absolute -inset-x-8 top-1/2 h-10 bg-indigo-500/10 blur-3xl -z-10 pointer-events-none" />
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl text-white tracking-tight max-w-[580px] mb-3 font-semibold font-display">
          Assumption Not Found in Strategic Matrix
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-[540px] mb-8 leading-relaxed">
          The vector, thesis, or page you were navigating toward either pivoted into a new direction, was dismissed during executive reality-check, or never existed in the empirical audit trail.
        </p>

        {/* Telemetry Box */}
        <div className="w-full max-w-[620px] bg-[#1b1b20]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 text-left shadow-xl mb-8 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-sm font-mono">$&gt;</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                FounderSync Telemetry Feed
              </span>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-400">
              <span>Divergence Coordinates:</span>
              <span className="text-purple-300 bg-[#35343a]/60 px-2 py-0.5 rounded">
                [Route: /null_vector_0x9F]
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-400">
              <span>Confidence Coefficient:</span>
              <span className="text-rose-400 bg-[#35343a]/60 px-2 py-0.5 rounded font-semibold">
                0.00% [STRATEGIC_COLLAPSE]
              </span>
            </div>
            <div className="pt-2 bg-[#1f1f24]/50 p-2.5 rounded-lg border border-white/5">
              <span className="text-indigo-300 font-semibold text-[11px] uppercase tracking-wider block mb-1">
                Recommended Synthesis:
              </span>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                Re-anchor to the executive dashboard or consult active market hypotheses to regain telemetry parity.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[520px] mb-8">
          <Link
            href="/"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer group"
          >
            <span>Return to Executive Dashboard</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="/#assumptions"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#2a292f] hover:bg-[#35343a] text-white font-semibold text-sm transition-all cursor-pointer border border-white/10"
          >
            <span>Review Active Assumptions</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="font-mono">SYS_VER: 4.8.2-CORP</span>
        </div>
      </main>
    </div>
  );
}
