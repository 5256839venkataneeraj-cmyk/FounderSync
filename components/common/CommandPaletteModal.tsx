'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useFounderSync } from '@/context/FounderSyncContext';
import { FigmaTab } from '@/lib/types';

interface SearchItem {
  id: string;
  category: 'views' | 'metrics' | 'actions';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPaletteModal() {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    activeTab,
    setActiveTab,
    setIsCalendarModalOpen,
    setIsNameModalOpen,
    userName,
    currentDateFormatted,
  } = useUserProfile();

  const { state, resetAll } = useFounderSync();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open & reset state
  useEffect(() => {
    if (isSearchModalOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchModalOpen]);

  // Search items definition
  const searchItems: SearchItem[] = useMemo(() => {
    const growth = state.growthMetrics || { arr: 1450000, churnRate: 3.8, ltv: 24500, burnRate: 85000 };
    const human = state.humanMetrics || { burnoutIndex: 68, customerTrustScore: 84, founderCognitiveLoad: 79, retentionSentiment: 62 };

    const items: SearchItem[] = [
      // 1. Navigation Views
      {
        id: 'view-dashboard',
        category: 'views',
        title: 'Executive Dashboard',
        subtitle: 'Overview of ARR velocity, Burnout balance, and Time-Series telemetry',
        badge: 'View',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            📊
          </span>
        ),
        action: () => {
          setActiveTab('dashboard');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'view-advisor',
        category: 'views',
        title: 'Contradictory Advisor & Reality-Check Engine',
        subtitle: 'Adversarial Devil’s Advocate pushback powered by Gemini 3.6 & Groq',
        badge: 'View',
        badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            ⚖️
          </span>
        ),
        action: () => {
          setActiveTab('advisor');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'view-reports',
        category: 'views',
        title: 'Strategic Reports & Audits',
        subtitle: 'Executive board memos, HITL decision logs, and imbalance diagnostics',
        badge: 'View',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            📄
          </span>
        ),
        action: () => {
          setActiveTab('reports');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'view-insights',
        category: 'views',
        title: 'Team & Customer Insights',
        subtitle: 'Deep dive into Team Burnout Index, Customer Trust Score, and Sentiment',
        badge: 'View',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            📈
          </span>
        ),
        action: () => {
          setActiveTab('insights');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'view-settings',
        category: 'views',
        title: 'Settings & Model Governance',
        subtitle: 'Configure Google AI Studio / Gemini & Groq keys, models, and RLS',
        badge: 'Config',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            ⚙️
          </span>
        ),
        action: () => {
          setActiveTab('settings');
          setIsSearchModalOpen(false);
        },
      },

      // 2. Core Metrics
      {
        id: 'metric-arr',
        category: 'metrics',
        title: `ARR: $${((growth.arr || 1450000) / 1000000).toFixed(2)}M`,
        subtitle: 'Annual Recurring Revenue pacing at +18% MoM acceleration',
        badge: 'Metric',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            💵
          </span>
        ),
        action: () => {
          setActiveTab('dashboard');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'metric-churn',
        category: 'metrics',
        title: `Gross Churn Rate: ${Number(growth.churnRate || 3.8).toFixed(1)}%`,
        subtitle: 'Monthly gross subscriber attrition within healthy 4% threshold',
        badge: 'Metric',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            📉
          </span>
        ),
        action: () => {
          setActiveTab('dashboard');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'metric-burnout',
        category: 'metrics',
        title: `Team Burnout Index: ${human.burnoutIndex || 68}/100`,
        subtitle: 'High cognitive friction across core product engineering squad',
        badge: 'Sustainability',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            🧠
          </span>
        ),
        action: () => {
          setActiveTab('insights');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'metric-trust',
        category: 'metrics',
        title: `Customer Trust Score: ${human.customerTrustScore || 84}/100`,
        subtitle: 'High enterprise conviction and customer advocacy defensibility',
        badge: 'Sustainability',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            🛡️
          </span>
        ),
        action: () => {
          setActiveTab('insights');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'metric-cognitive',
        category: 'metrics',
        title: `Founder Cognitive Load: ${human.founderCognitiveLoad || 79}/100`,
        subtitle: 'Context-switching tax elevated due to concurrent capital & hiring initiatives',
        badge: 'Executive Health',
        badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            ⚡
          </span>
        ),
        action: () => {
          setActiveTab('insights');
          setIsSearchModalOpen(false);
        },
      },

      // 3. Quick Actions
      {
        id: 'action-reality-check',
        category: 'actions',
        title: 'Run Strategy Reality-Check',
        subtitle: 'Test assumptions against Gemini 3.6 and Groq adversarial advisor',
        badge: 'Action',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            ⚡
          </span>
        ),
        action: () => {
          setActiveTab('advisor');
          setIsSearchModalOpen(false);
        },
      },
      {
        id: 'action-calendar',
        category: 'actions',
        title: 'Open Google Calendar',
        subtitle: `Manage today's deliberations and sync sounding board sessions (${currentDateFormatted})`,
        badge: 'Integration',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            📅
          </span>
        ),
        action: () => {
          setIsSearchModalOpen(false);
          setIsCalendarModalOpen(true);
        },
      },
      {
        id: 'action-edit-name',
        category: 'actions',
        title: `Edit Founder Profile Name (Current: ${userName})`,
        subtitle: 'Personalize your greeting and workspace identification',
        badge: 'Profile',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            👤
          </span>
        ),
        action: () => {
          setIsSearchModalOpen(false);
          setIsNameModalOpen(true);
        },
      },
      {
        id: 'action-reset',
        category: 'actions',
        title: 'Reset Baseline Metrics & Seed Data',
        subtitle: 'Restore demo environment to default Industry 6.0 benchmark figures',
        badge: 'Danger',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: (
          <span className="text-base p-1.5 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            ↺
          </span>
        ),
        action: () => {
          setIsSearchModalOpen(false);
          if (confirm('Reset all metrics, decisions, and audit logs to initial seed data?')) {
            resetAll();
            alert('All metrics reset to seed baseline.');
          }
        },
      },
    ];

    return items;
  }, [state, userName, currentDateFormatted, setActiveTab, setIsSearchModalOpen, setIsCalendarModalOpen, setIsNameModalOpen, resetAll]);

  // Filter items based on user search query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return searchItems;
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.badge?.toLowerCase().includes(q)
    );
  }, [query, searchItems]);

  // Keep selected index in range
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchModalOpen(false);
    }
  };

  if (!isSearchModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[80vh] transition-all transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <span className="text-slate-400">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search views, metrics, decisions, or actions..."
            className="flex-1 text-sm bg-transparent placeholder:text-slate-400 text-slate-900 focus:outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-50 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-semibold text-slate-600">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400">Try searching for &quot;Advisor&quot;, &quot;ARR&quot;, &quot;Burnout&quot;, or &quot;Settings&quot;.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 text-indigo-950 border border-indigo-200/80 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <kbd
                      className={`text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                          : 'text-slate-400 bg-slate-100'
                      }`}
                    >
                      ↵
                    </kbd>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">↑</kbd>
              <kbd className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px] ml-1">↓</kbd> navigate
            </span>
            <span>
              <kbd className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">↵</kbd> select
            </span>
            <span>
              <kbd className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">esc</kbd> close
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            FounderSync Command Center
          </div>
        </div>
      </div>
    </div>
  );
}
