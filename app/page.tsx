'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TopNavbar, FigmaTab } from '@/components/figma/TopNavbar';
import { DashboardView } from '@/components/figma/DashboardView';
import { AdvisorView } from '@/components/figma/AdvisorView';
import { ReportsView } from '@/components/figma/ReportsView';
import { InsightsView } from '@/components/figma/InsightsView';
import { SettingsView } from '@/components/figma/SettingsView';
import { ConciergeView } from '@/components/figma/ConciergeView';
import { FaqView } from '@/components/figma/FaqView';
import { OnboardingModal } from '@/components/figma/OnboardingModal';

import { useUserProfile } from '@/context/UserProfileContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { activeTab, setActiveTab } = useUserProfile();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Loading state while checking initial session (times out gracefully after 1.5s)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] dark:bg-[#0F0F14] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md animate-pulse">
            FS
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Synchronizing session credentials...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD] dark:bg-[#0F0F14] text-slate-900 dark:text-[#F1F1F5] flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Top Horizontal Navigation Bar (as requested by user) */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area (padded for floating top navbar) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigateToAdvisor={() => setActiveTab('advisor')} />
        )}

        {activeTab === 'advisor' && (
          <AdvisorView />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'insights' && (
          <InsightsView />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}

        {activeTab === 'faq' && (
          <FaqView
            onNavigateToConcierge={() => setActiveTab('concierge')}
            onNavigateToAdvisor={() => setActiveTab('advisor')}
          />
        )}

        {activeTab === 'concierge' && (
          <ConciergeView onNavigateToAdvisor={() => setActiveTab('advisor')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#14141C] border-t border-slate-200/80 dark:border-white/10 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-100">FounderSync</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Strategic FAQ
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveTab('concierge')}
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Executive Concierge &amp; Contact
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveTab('advisor')}
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Contradictory Advisor
            </button>
            <span>•</span>
            <a
              href="mailto:potluri.venkata2026@vitstudent.ac.in"
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              potluri.venkata2026@vitstudent.ac.in
            </a>
          </div>
        </div>
      </footer>

      {/* Onboarding / Sign-in Modal (Screen 1 in Figma) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
