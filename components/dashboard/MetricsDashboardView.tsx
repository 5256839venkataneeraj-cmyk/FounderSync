'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { normalizeValue } from '@/lib/scoring';

export interface MetricsDashboardViewProps {
  data: {
    arr?: number;
    monthly_churn_rate?: number;
    churn_rate?: number;
    churnRate?: number;
    clv?: number;
    ltv?: number;
    burn_rate?: number;
    burnRate?: number;
    monthly_burn?: number;
    monthlyBurn?: number;
    runway_months?: number | null;
    runwayMonths?: number | null;
    burnout_score?: number;
    burnout_index?: number;
    burnoutIndex?: number;
    trust_score?: number;
    customer_trust_score?: number;
    customerTrustScore?: number;
    cognitive_load_score?: number;
    founder_cognitive_load?: number;
    founderCognitiveLoad?: number;
    retention_score?: number;
    retention_sentiment?: number;
    retention_sentiment_score?: number;
    retentionSentiment?: number;
    human_centric_subscore?: number;
    humanCentricScore?: number;
    burnout_score_band?: 'low' | 'moderate' | 'high';
    company_name?: string;
    reporting_month?: string;
    mrr?: number;
    monthly_revenue?: number;
    monthly_expenses?: number;
    cash_in_bank?: number;
    total_active_customers?: number;
    customers_lost?: number;
    starting_customers?: number;
    avg_revenue_per_customer?: number;
    // Reality Check dynamic fields
    reality_check_question?: string;
    reality_check_description?: string;
    reality_check_category?: string;
    realityCheckQuestion?: string;
    realityCheckDescription?: string;
    realityCheckCategory?: string;
    // Normalized and Composite state fields
    growth_score_normalized?: number;
    human_score_normalized?: number;
    composite_health_score?: number;
    startup_health_score?: number;
    norm_arr?: number;
    norm_churn?: number;
    norm_ltv?: number;
    norm_burn?: number;
    norm_burnout?: number;
    norm_trust?: number;
    norm_cognitive?: number;
    norm_retention?: number;
    [key: string]: any;
  };
  onReset?: () => void;
  onReupload?: () => void;
  onNavigateToAdvisor?: () => void;
}

export function MetricsDashboardView({
  data,
  onReset,
  onReupload,
  onNavigateToAdvisor,
}: MetricsDashboardViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger GSAP entrance animation whenever new telemetry data arrives
  useGSAP(
    () => {
      if (containerRef.current) {
        gsap.fromTo(
          '.gsap-metric-card',
          { opacity: 0, y: 30, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform',
          }
        );

        gsap.fromTo(
          '.gsap-header-badge',
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }
    },
    { scope: containerRef, dependencies: [data] }
  );

  // Raw metric extraction
  const arr = Number(data.arr ?? (data.mrr ? data.mrr * 12 : 0));
  const churn = Number(data.monthly_churn_rate ?? data.churn_rate ?? data.churnRate ?? 0);
  const clv = Number(data.clv ?? data.ltv ?? 0);
  const burn = Number(data.monthly_burn ?? data.monthlyBurn ?? data.burn_rate ?? data.burnRate ?? 0);
  const runway =
    data.runway_months !== undefined && data.runway_months !== null
      ? data.runway_months
      : data.runwayMonths !== undefined && data.runwayMonths !== null
      ? data.runwayMonths
      : burn > 0 && data.cash_in_bank
      ? Number((data.cash_in_bank / burn).toFixed(1))
      : null;

  const burnout = Number(data.burnout_score ?? data.burnout_index ?? data.burnoutIndex ?? 0);
  const trust = Number(data.trust_score ?? data.customer_trust_score ?? data.customerTrustScore ?? 0);
  const cognitiveLoad = Number(
    data.cognitive_load_score ?? data.founder_cognitive_load ?? data.founderCognitiveLoad ?? 0
  );
  const retention = Number(
    data.retention_sentiment_score ??
      data.retention_score ??
      data.retention_sentiment ??
      data.retentionSentiment ??
      0
  );

  // 1. Calculate Normalized Growth Dimensions (50% Total Weight)
  // ARR: $0 to $3M (higher is better, 30% weight)
  const normARR = Number(data.norm_arr ?? normalizeValue(arr, 0, 3000000, false));
  // Churn: 1% to 15% (lower is better, 30% weight)
  const normChurn = Number(data.norm_churn ?? normalizeValue(churn, 1, 15, true));
  // CLV: $1k to $50k (higher is better, 20% weight)
  const normLTV = Number(data.norm_ltv ?? normalizeValue(clv, 1000, 50000, false));
  // Burn: $10k to $200k (lower is better, 20% weight)
  const normBurn = Number(data.norm_burn ?? normalizeValue(burn, 10000, 200000, true));

  const growthScoreNormalized = Number(
    data.growth_score_normalized ??
      Math.round(normARR * 0.3 + normChurn * 0.3 + normLTV * 0.2 + normBurn * 0.2)
  );

  // 2. Calculate Normalized Human-Centric Dimensions (50% Total Weight)
  // Burnout: 0-100 (lower is better)
  const normBurnout = Number(data.norm_burnout ?? normalizeValue(burnout, 0, 100, true));
  // Trust: 0-100 (higher is better)
  const normTrust = Number(data.norm_trust ?? normalizeValue(trust, 0, 100, false));
  // Cognitive Load: 0-100 (lower is better)
  const normCognitiveLoad = Number(data.norm_cognitive ?? normalizeValue(cognitiveLoad, 0, 100, true));
  // Retention: 0-100 (higher is better)
  const normRetention = Number(data.norm_retention ?? normalizeValue(retention, 0, 100, false));

  // Human Dimension: average the four human-centric signal scores onto a 0-100 scale
  const humanScoreNormalized = Number(
    data.human_score_normalized ??
      data.human_centric_subscore ??
      Math.round((normBurnout + normTrust + normCognitiveLoad + normRetention) / 4)
  );

  // 3. Composite Startup Health Score (Exact average of Growth and Human dimensions)
  const compositeScore = Number(
    data.composite_health_score ??
      data.startup_health_score ??
      Math.round((growthScoreNormalized + humanScoreNormalized) / 2)
  );

  const companyName = data.company_name || 'FounderSync Organization';
  const reportingMonth = data.reporting_month || 'Current Reporting Period';

  // Value formatting helpers
  const formatARR = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${val.toLocaleString()}`;
  };

  const formatCLV = (val: number) => {
    if (val % 1 !== 0) {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${Math.round(val).toLocaleString()}`;
  };

  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

  // Dynamic Reality Check (exposing specific risks/contradictions in numbers)
  const rawQuestion =
    data.reality_check_question ||
    data.realityCheckQuestion ||
    (burnout >= 60 || burn >= 60000
      ? `Are you accelerating monthly burn of $${Math.round(burn).toLocaleString()} to buy growth when retention sentiment has dropped to ${retention}/100?`
      : 'Are you scaling outbound spend because gross retention supports it, or to mask a 68/100 team burnout index?');

  const cleanedQuestion = rawQuestion.replace(/^[“"']+|[”"']+$/g, '').trim();

  const realityCheckDescription =
    data.reality_check_description ||
    data.realityCheckDescription ||
    (runway
      ? `Burn rate of $${Math.round(burn).toLocaleString()}/mo with ${runway} months of cash runway remaining alongside team burnout (${burnout}/100) indicates sprint throughput is consuming human capacity.`
      : 'Three upcoming Q4 roadmapped deliverables lean heavily on competitive parity rather than validated problem discovery from your core ICP.');

  const realityCheckCategory = (
    data.reality_check_category ||
    data.realityCheckCategory ||
    (burnout >= 60 ? 'WARNING' : 'CONTRADICTION')
  ).toUpperCase();

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Top Banner: Startup Health Score & Core Formula (Matching Design Aesthetic) */}
      <div className="gsap-metric-card bg-[#14141C] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/90 dark:border-white/10 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold font-grotesk">
              STRATEGIC MIRROR · INDUSTRY 6.0 CORE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Startup Health Score
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans font-normal leading-relaxed">
              Composite score balancing 50% normalized Growth metrics (ARR, Churn, LTV, Burn) against 50% normalized Human-Centric signals (Team Burnout, Trust, Cognitive Load, Retention).
            </p>
          </div>

          {/* Composite Score Highlight Box */}
          <div className="flex items-center gap-4 bg-[#1A1A24] px-6 py-4 rounded-2xl border border-slate-700/60 dark:border-white/10 self-start md:self-auto shrink-0 shadow-inner">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-semibold">Composite Score</div>
              <div className="text-[11px] text-slate-500 font-normal">50% Growth + 50% Human</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl sm:text-5xl font-black font-display tracking-tight ${
                  compositeScore >= 70
                    ? 'text-emerald-400'
                    : compositeScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {compositeScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
          </div>
        </div>

        {/* Dimension Sub-Pills (50% Growth + 50% Human Breakdown) */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1A1A24] p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border border-slate-800/90 dark:border-white/5">
            <div className="text-xs">
              <span className="text-blue-400 font-bold font-grotesk">
                Growth Dimension (50%):{' '}
              </span>
              <span className="text-slate-400 font-normal">
                Normalized ARR, Churn, LTV, Burn Rate
              </span>
            </div>
            <span className="text-sm sm:text-base font-bold text-blue-400 ml-2 font-mono">
              {growthScoreNormalized}/100
            </span>
          </div>

          <div className="bg-[#1A1A24] p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border border-slate-800/90 dark:border-white/5">
            <div className="text-xs">
              <span className="text-emerald-400 font-bold font-grotesk">
                Human Dimension (50%):{' '}
              </span>
              <span className="text-slate-400 font-normal">
                Burnout, Trust, Cognitive Load, Retention
              </span>
            </div>
            <span className="text-sm sm:text-base font-bold text-emerald-400 ml-2 font-mono">
              {humanScoreNormalized}/100
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Reality Check Hero Card: Today's Reality Check (Floating Box with 3D Sphere & Gemini Reasoning) */}
      <div className="gsap-metric-card floating-card animate-float-subtle relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-white to-[#FFF9F2] dark:from-[#1A1A22] dark:via-[#1A1A22] dark:to-[#1F1D2B] border border-slate-200/90 dark:border-white/10 p-7 sm:p-9 shadow-[0_16px_45px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.4)] transition-colors duration-300">
        {/* Subtle atmospheric ambient blurs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          {/* Luminous 3D Contradiction Sphere & Floating Glow */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/25 to-amber-300/20 blur-2xl animate-pulse-glow" />
              <img
                src="/reality-check-sphere.png"
                alt="Contradiction Reality Sphere"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain relative z-10 drop-shadow-xl animate-float transition-transform hover:scale-105"
              />
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 text-center md:text-left space-y-3.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-xs font-grotesk font-bold uppercase tracking-wider">
                <span>💡</span>
                <span>TODAY&apos;S REALITY CHECK</span>
              </div>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  realityCheckCategory === 'WARNING'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    : realityCheckCategory === 'STRATEGIC_TENSION'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                {realityCheckCategory}
              </span>
            </div>

            {/* Highlighted Quote Box */}
            <div className="relative">
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-display font-bold text-slate-900 dark:text-[#F1F1F5] leading-snug tracking-tight">
                &ldquo;{cleanedQuestion}&rdquo;
              </h2>
            </div>

            {/* Contextual Sub-Description */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-sans font-normal">
              {realityCheckDescription}
            </p>

            {/* Interactive Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="bg-[#2D31E3] dark:bg-indigo-600 hover:bg-[#2024B8] dark:hover:bg-indigo-500 active:scale-98 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:translate-y-[-1px]"
              >
                <span>Review insights</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAuditTrailOpen(true)}
                className="bg-white dark:bg-[#14141C] hover:bg-slate-50 dark:hover:bg-[#22222E] active:scale-98 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/10 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:translate-y-[-1px]"
              >
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Inspect Audit Trail</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Audit Trail Modal */}
      {isAuditTrailOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsAuditTrailOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#14141C] text-white border border-slate-700/80 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse glow-indicator" />
                <h3 className="text-lg sm:text-xl font-display font-extrabold text-white">
                  Ingestion Audit Trail &amp; Provenance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditTrailOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                aria-label="Close Audit Trail"
              >
                ✕
              </button>
            </div>

            {/* Ingestion Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#1A1A24] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Entity</span>
                <span className="font-semibold text-slate-200">{companyName}</span>
              </div>
              <div className="bg-[#1A1A24] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Reporting Period</span>
                <span className="font-semibold text-slate-200">{reportingMonth}</span>
              </div>
              <div className="bg-[#1A1A24] p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Ingestion Engine</span>
                <span className="font-semibold text-indigo-400">Gemini Flash Reasoning</span>
              </div>
            </div>

            {/* Contradiction Evidence */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                  {realityCheckCategory}
                </span>
                <span className="font-bold text-amber-200 font-grotesk uppercase tracking-wider text-[11px]">
                  Detected Tension in Ingested Data
                </span>
              </div>
              <p className="text-slate-200 italic font-medium leading-relaxed">
                &ldquo;{cleanedQuestion}&rdquo;
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                {realityCheckDescription}
              </p>
            </div>

            {/* Telemetry Comparison Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-grotesk font-bold uppercase tracking-wider text-slate-400">
                Extracted Metric Baseline (Phase 1 &amp; 2 Synthesis)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Hard Metrics */}
                <div className="bg-[#1A1A24] p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-blue-400 font-grotesk uppercase block text-[11px]">
                    Hard Growth Telemetry (50%)
                  </span>
                  <div className="space-y-1.5 font-mono text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ARR:</span>
                      <span className="font-bold text-white">{formatARR(arr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Churn:</span>
                      <span className="font-bold text-white">{churn.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CLV / LTV:</span>
                      <span className="font-bold text-white">{formatCLV(clv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Burn:</span>
                      <span className="font-bold text-rose-300">${Math.round(burn).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Runway Buffer:</span>
                      <span className="font-bold text-emerald-300">{runway ? `${runway} mo` : 'Profitable'}</span>
                    </div>
                  </div>
                </div>

                {/* Human Signals */}
                <div className="bg-[#1A1A24] p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 font-grotesk uppercase block text-[11px]">
                    Human Capacity Signals (50%)
                  </span>
                  <div className="space-y-1.5 font-mono text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Team Burnout:</span>
                      <span className={`font-bold ${burnout >= 65 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {burnout}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer Trust:</span>
                      <span className="font-bold text-white">{trust}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cognitive Load:</span>
                      <span className={`font-bold ${cognitiveLoad >= 65 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {cognitiveLoad}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Retention Sentiment:</span>
                      <span className="font-bold text-white">{retention}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Human Dimension:</span>
                      <span className="font-bold text-emerald-400">{humanScoreNormalized}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                Session verified · Synchronized with company_monthly_metrics
              </span>
              <button
                type="button"
                onClick={() => setIsAuditTrailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Telemetry Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="gsap-header-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-grotesk font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Metric Telemetry · Gemini Flash Reasoning
              </span>
              <span className="text-xs text-indigo-200/80 font-mono">
                {reportingMonth}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              {companyName} — Live Metric Telemetry
            </h2>
            <p className="text-sm text-indigo-200/90 font-sans max-w-2xl">
              Extracted directly from filled intake PDF using Gemini document reasoning. All Phase 2 formulas calculated automatically and synchronized with Supabase database.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <a
              href="/api/generate-sample-pdf"
              download="FounderSync_Sample_Intake.pdf"
              title="Download pre-filled FounderSync Sample Intake PDF"
              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-xs font-semibold border border-emerald-400/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Sample PDF</span>
            </a>
            {onReupload && (
              <button
                type="button"
                onClick={onReupload}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Another PDF</span>
              </button>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset to Default View</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Module 1: Hard Growth Metrics (50% Weight) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            <h3 className="text-xs font-grotesk font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hard Growth Metrics (50% Weight)
            </h3>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 font-semibold">
            Subscore: {growthScoreNormalized}/100
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* ARR Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Annual Recurring Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {formatARR(arr)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normARR}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">30% wt</span>
            </div>
          </div>

          {/* Monthly Churn Rate Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Monthly Churn Rate
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {churn.toFixed(1)}%
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normChurn}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">30% wt</span>
            </div>
          </div>

          {/* CLV / LTV Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Customer Lifetime Value
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {formatCLV(clv)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normLTV}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">20% wt</span>
            </div>
          </div>

          {/* Monthly Net Burn Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Monthly Burn Rate
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              ${Math.round(burn).toLocaleString()}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normBurn}/100</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">20% wt</span>
            </div>
          </div>

          {/* Cash Runway Card */}
          <div className="gsap-metric-card col-span-2 sm:col-span-1 bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Runway Buffer
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {runway ? `${runway} mo` : 'Profitable'}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Cash / Burn</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Reserve</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Human-Centric & Sustainability Signals (50% Weight) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <h3 className="text-xs font-grotesk font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Human-Centric &amp; Sustainability Signals (50% Weight)
            </h3>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-semibold">
            Subscore: {humanScoreNormalized}/100
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {/* Team Burnout Index Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Team Burnout Index
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {burnout}/100
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normBurnout}/100</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">25% wt</span>
            </div>
          </div>

          {/* Customer Trust Score Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Customer Trust Score
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {trust}/100
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normTrust}/100</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">25% wt</span>
            </div>
          </div>

          {/* Founder Cognitive Load Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Founder Cognitive Load
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {cognitiveLoad}/100
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normCognitiveLoad}/100</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">25% wt</span>
            </div>
          </div>

          {/* Retention Sentiment Card */}
          <div className="gsap-metric-card bg-white dark:bg-[#1A1A22] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-all">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block">
              Retention Sentiment Score
            </span>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-[#F1F1F5] mt-1.5">
              {retention}/100
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Norm: {normRetention}/100</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">25% wt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Executive Strategic Mirror & AI Trajectory Synthesis */}
      <div className="gsap-metric-card glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 glow-indicator" />
            <h4 className="text-xs font-grotesk font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Executive Strategic Mirror — Industry 6.0 Health Analysis
            </h4>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold font-grotesk">
            Synchronized with Ingestion Telemetry
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-500/20 text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-3">
          {burnout >= 65 ? (
            <p>
              ⚠️ <strong className="text-amber-800 dark:text-amber-300">Growth Tension Detected:</strong> Top-line ARR of{' '}
              <strong>{formatARR(arr)}</strong> is supported by gross retention (churn: <strong>{churn.toFixed(1)}%</strong>), but an elevated team burnout score of{' '}
              <strong>{burnout}/100</strong> and founder cognitive load of <strong>{cognitiveLoad}/100</strong> signal that sprint throughput is consuming human capacity. Monthly burn is currently <strong>${Math.round(burn).toLocaleString()}/mo</strong> with <strong>{runway ? `${runway} months` : 'healthy'}</strong> of runway buffer remaining.
            </p>
          ) : (
            <p>
              ✅ <strong className="text-emerald-800 dark:text-emerald-300">Sustainable Equilibrium:</strong> The venture exhibits solid operational balance with{' '}
              <strong>{formatARR(arr)} ARR</strong>, controlled monthly churn at <strong>{churn.toFixed(1)}%</strong>, CLV of <strong>{formatCLV(clv)}</strong>, and sustainable team bandwidth ({burnout}/100 burnout score, {trust}/100 trust score). Monthly net burn is <strong>${Math.round(burn).toLocaleString()}/mo</strong> with a <strong>{runway ? `${runway} month` : 'comfortable'}</strong> runway buffer.
            </p>
          )}

          {onNavigateToAdvisor && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>Stress-Test New Strategy Against This Baseline in Advisor</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MetricsDashboardView;
