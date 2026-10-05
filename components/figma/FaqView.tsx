'use client';

import React, { useState, useMemo } from 'react';

export interface FaqItem {
  id: string;
  category: 'advisor' | 'security' | 'telemetry' | 'pricing';
  categoryLabel: string;
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'advisor',
    categoryLabel: 'Contrarian Advisor',
    question: 'What differentiates FounderSync from standard AI copilots?',
    answer:
      'Unlike sycophantic chatbots optimized to agree with you, FounderSync functions as an adversarial dialectical sounding board. It actively pressure-tests board theses, interrogates unstated blindspots, and executes continuous contrarian validation on your operational telemetry.',
    tags: ['Dialectical Engine', 'Sounding Board', 'Blind Spots'],
  },
  {
    id: 'faq-2',
    category: 'advisor',
    categoryLabel: 'Contrarian Advisor',
    question: 'How does the Contradictory Advisor evaluate hypotheses?',
    answer:
      'The Contradictory Advisor ingests historical board memorandums, telemetry data, and key executive assumptions, then simulates opposing stakeholder perspectives (skeptical venture partners, cynical engineering leads, or competing market incumbents) to locate fragility before it manifests.',
    tags: ['Adversarial Simulation', 'Decision Testing', 'Venture Logic'],
  },
  {
    id: 'faq-3',
    category: 'security',
    categoryLabel: 'Security & Enclaves',
    question: 'Why should we choose zero-persistence sovereign enclaves?',
    answer:
      'Enterprise founders handle non-public material information, runway calibrations, and sensitive personnel changes. Our Zero-RAM sovereign hardware enclaves guarantee cryptographic isolation—no models are trained on your strategic payloads, and volatile memory is wiped immediately after synthesis.',
    tags: ['Zero-RAM', 'Confidential Computing', 'Non-Persistent'],
  },
  {
    id: 'faq-4',
    category: 'security',
    categoryLabel: 'Security & Enclaves',
    question: 'Are my financial metrics and board decks stored or trained on?',
    answer:
      'Never. FounderSync operates under strict zero-training terms with enterprise-grade cryptographic guarantees. Your balance sheets, ARR velocity figures, and strategic deliberations remain strictly in your sovereign workspace container and are never used to train third-party foundation models.',
    tags: ['Privacy', 'No Model Training', 'Data Sovereignty'],
  },
  {
    id: 'faq-5',
    category: 'telemetry',
    categoryLabel: 'Telemetry & Integrations',
    question: 'What integrations does FounderSync support (Slack, Gong, Linear)?',
    answer:
      'FounderSync pairs natively via authenticated read-only webhooks into Slack executive channels, Gong client sentiment transcriptions, Linear engineering sprint velocity, and Salesforce deal slippage alerts to construct continuous real-time divergence health checks.',
    tags: ['Webhooks', 'Slack', 'Linear', 'Salesforce', 'Gong'],
  },
  {
    id: 'faq-6',
    category: 'telemetry',
    categoryLabel: 'Telemetry & Integrations',
    question: 'How does the Monthly Intake Template work?',
    answer:
      'Founders can download our standardized intake template (.md or PDF), fill in raw qualitative observations alongside financial telemetry, and re-upload. Our ingestion pipeline parses assumptions and cross-references them against previous months to calculate empirical divergence scores.',
    tags: ['Intake Template', 'Monthly Metrics', 'Empirical Divergence'],
  },
  {
    id: 'faq-7',
    category: 'pricing',
    categoryLabel: 'Pricing & Concierge',
    question: 'I am a solo tech founder. What tier should I start with?',
    answer:
      'Solo founders and early seed operators can begin with our Private Office tier, which offers automated contrarian sounding board sessions and direct concierge dispatch with under 2-hour priority turnaround for high-stakes decisions.',
    tags: ['Solo Founders', 'Private Office', 'Seed Stage'],
  },
  {
    id: 'faq-8',
    category: 'pricing',
    categoryLabel: 'Pricing & Concierge',
    question: 'How does the Executive Concierge SLA work?',
    answer:
      'When you submit an urgent inquiry or challenge through the Executive Concierge, a senior strategic partner reviews the model divergence output and provides structured principal counter-perspectives within guaranteed 2-hour turnaround windows during active financing or boardroom cycles.',
    tags: ['Concierge SLA', '2-Hour Guarantee', 'Board Cycles'],
  },
];

interface FaqViewProps {
  onNavigateToConcierge?: () => void;
  onNavigateToAdvisor?: () => void;
}

export function FaqView({ onNavigateToConcierge, onNavigateToAdvisor }: FaqViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['faq-1', 'faq-2']));

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'advisor', label: 'Contrarian Advisor' },
    { id: 'security', label: 'Security & Enclaves' },
    { id: 'telemetry', label: 'Telemetry & Data' },
    { id: 'pricing', label: 'Pricing & Concierge' },
  ];

  const filteredItems = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesText =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesText;
    });
  }, [searchQuery, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenIds(new Set(FAQ_DATA.map((i) => i.id)));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  return (
    <div className="flex flex-col w-full relative overflow-hidden text-slate-800 dark:text-[#E4E1E9]">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/3 w-[600px] h-[500px] rounded-full bg-purple-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-[600px] -right-20 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[150px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10 flex flex-col gap-8 sm:gap-12">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-[#1F1F24] border border-purple-200/60 dark:border-white/10 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#DDB7FF] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-700 dark:text-[#DDB7FF] font-semibold">
              Strategic Knowledge Base &amp; FAQ
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-bold tracking-tight text-slate-900 dark:text-[#F1F1F5]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#C7C4D7] leading-relaxed">
            Direct clarity on dialectical sounding boards, contrarian heuristics, zero-persistence enclaves, and telemetry integrations.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
          {/* Search Box */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, keywords, or architectural topics..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-[#14141C] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-[#F1F1F5] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-[#1B1B20] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/5 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={expandAll}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer underline"
              >
                Expand all
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer underline"
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
          {filteredItems.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-[#14141C] border border-slate-200 dark:border-white/10 text-center flex flex-col items-center gap-3">
              <span className="text-2xl">🔍</span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No matching questions found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-slate-500">
                Try searching for broader terms or reach out directly to the Executive Concierge.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-[#1B1B20] border-indigo-400 dark:border-[#C0C1FF]/40 shadow-xs'
                      : 'bg-white/80 dark:bg-[#14141C] border-slate-200/70 dark:border-white/5 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 pr-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-[#C0C1FF]">
                        {item.categoryLabel}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#E4E1E9]">
                        {item.question}
                      </span>
                    </div>
                    <span
                      className={`text-slate-400 transform transition-transform duration-200 shrink-0 font-bold ${
                        isOpen ? 'rotate-180 text-indigo-600 dark:text-[#C0C1FF]' : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 flex flex-col gap-3 text-xs sm:text-sm text-slate-600 dark:text-[#C7C4D7] leading-relaxed border-t border-slate-100 dark:border-white/5">
                      <p>{item.answer}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-mono text-slate-500 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions? Help Banner */}
        <div className="max-w-3xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-indigo-50/80 dark:bg-[#181822] border border-indigo-200/80 dark:border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xs">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F1F1F5]">
              Still have unverified strategic assumptions?
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#C7C4D7] max-w-md">
              Speak directly with our sovereign advisory unit or dispatch a private hypothesis check.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {onNavigateToConcierge && (
              <button
                type="button"
                onClick={onNavigateToConcierge}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Executive Concierge
              </button>
            )}
            {onNavigateToAdvisor && (
              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#20202A] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:text-indigo-600 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                Launch Advisor →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
