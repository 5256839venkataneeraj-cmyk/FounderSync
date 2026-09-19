'use client';

import React, { useState } from 'react';
import { useFounderSync } from '@/context/FounderSyncContext';
import { DecisionAuditLog } from '@/components/hitl/DecisionAuditLog';

interface ReportItem {
  id: string;
  severity: 'high' | 'medium' | 'opportunity' | 'low';
  severityLabel: string;
  category: string;
  timeAgo: string;
  title: string;
  metricLabel: string;
  metricValue: string;
  detail: string;
}

const SAMPLE_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    severity: 'high',
    severityLabel: 'High Severity',
    category: 'Strategic Drift',
    timeAgo: '4 days ago',
    title: 'GTM Over-reliance on Paid Ads',
    metricLabel: 'CAC Expansion',
    metricValue: 'CAC: $410 → $525 (+28%)',
    detail: 'Customer acquisition cost has escalated by 28% over the last 60 days as ad fatigue sets in on primary search campaigns, masking a lack of organic word-of-mouth referral loops.',
  },
  {
    id: 'rep-2',
    severity: 'medium',
    severityLabel: 'Medium Severity',
    category: 'Resource Allocation',
    timeAgo: '1 week ago',
    title: 'Engineering Bandwidth vs Custom Integrations',
    metricLabel: 'Roadmap Delay',
    metricValue: 'Roadmap Slip: 3 Sprints',
    detail: 'Bespoke integration promises made during enterprise sales cycles have diverted 40% of senior core engineering capacity, stalling primary product roadmap milestones.',
  },
  {
    id: 'rep-3',
    severity: 'opportunity',
    severityLabel: 'Opportunity',
    category: 'Value Capture',
    timeAgo: '2 weeks ago',
    title: 'Underpricing Enterprise Security Add-ons',
    metricLabel: 'Expansion MRR',
    metricValue: 'Potential ARR Delta: +$180k/yr',
    detail: 'SOC2 Type II, SSO, and audit log exports are currently bundled into mid-market tiers. Unbundling them into a dedicated Enterprise Security pack can lift ACV by 22% with zero customer friction.',
  },
  {
    id: 'rep-4',
    severity: 'low',
    severityLabel: 'Low Severity',
    category: 'Account Health',
    timeAgo: '3 weeks ago',
    title: 'Single-thread Buyer Risk in Seed Accounts',
    metricLabel: 'Pilot Fragility',
    metricValue: '7 of 10 Pilots Exposed',
    detail: 'Seven active enterprise pilots rely on a single internal champion. If that contact departs or re-orgs, conversion probability plunges by 75%. Require multi-threaded executive sponsor sign-offs.',
  },
];

export function ReportsView() {
  const { state } = useFounderSync();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredReports = SAMPLE_REPORTS.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.severity === selectedFilter;
  });

  const getSeverityStyles = (severity: ReportItem['severity']) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-l-4 border-l-rose-500',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          metricBadge: 'bg-rose-50 text-rose-800 border border-rose-200',
        };
      case 'medium':
        return {
          border: 'border-l-4 border-l-amber-500',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          metricBadge: 'bg-amber-50 text-amber-800 border border-amber-200',
        };
      case 'opportunity':
        return {
          border: 'border-l-4 border-l-indigo-500',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          metricBadge: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
        };
      case 'low':
      default:
        return {
          border: 'border-l-4 border-l-slate-400',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          metricBadge: 'bg-slate-100 text-slate-800 border border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Meta (Figma Screen 5) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
            Reality Check Archive · 4 critical discrepancies active
          </span>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-xs bg-white text-slate-800 font-semibold px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="high">High Severity Only</option>
              <option value="medium">Medium Severity Only</option>
              <option value="opportunity">Opportunities Only</option>
              <option value="low">Low Severity Only</option>
            </select>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Blind Spot Reports
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl">
          Synthesized strategic risks, customer friction patterns, and operational bottlenecks surfaced through contradictory cross-analysis.
        </p>
      </div>

      {/* 3 Summary Stat Tiles (Figma Screen 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {/* Tile 1: Assumptions Challenged */}
        <div className="floating-card bg-white rounded-3xl border border-slate-200/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Assumptions Challenged
            </span>
            <div className="text-2xl font-black text-slate-900">
              14 of 18
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tile 2: Critical Divergence */}
        <div className="floating-card animate-float-subtle bg-white rounded-3xl border border-slate-200/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Critical Divergence
            </span>
            <div className="text-2xl font-black text-amber-600">
              1 Active
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Tile 3: Identified Headroom */}
        <div className="floating-card bg-white rounded-3xl border border-slate-200/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Identified Headroom
            </span>
            <div className="text-2xl font-black text-indigo-600">
              +40% Margin
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Reports List Cards (Figma Screen 5) */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const styles = getSeverityStyles(report.severity);
          const isExpanded = expandedId === report.id;

          return (
            <div
              key={report.id}
              onClick={() => setExpandedId(isExpanded ? null : report.id)}
              className={`floating-card bg-white rounded-3xl border border-slate-200/90 ${styles.border} p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer space-y-3`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border ${styles.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                    <span>{report.severityLabel}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {report.category} · {report.timeAgo}
                  </span>
                </div>

                <span className="text-slate-400 text-sm hidden sm:block">
                  {isExpanded ? '▲ Close' : '▶'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {report.title}
                </h3>

                <span className={`text-xs font-bold px-3 py-1 rounded-xl w-fit ${styles.metricBadge}`}>
                  {report.metricValue}
                </span>
              </div>

              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl">
                  <p>{report.detail}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip Banner (Figma Screen 5) */}
      <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
        <span className="text-lg">💡</span>
        <p className="font-medium">
          <strong>Tip:</strong> A strategic blind spot ignored for 90 days behaves like compounding debt. Review high-severity discrepancies in your weekly executive sync.
        </p>
      </div>

      {/* Persisted Audit Log Drilldown */}
      <div className="pt-8 border-t border-slate-200/80">
        <DecisionAuditLog decisions={state.decisions} />
      </div>
    </div>
  );
}
