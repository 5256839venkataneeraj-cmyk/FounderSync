'use client';

import React, { useState } from 'react';
import { TopNavbar, FigmaTab } from '@/components/figma/TopNavbar';
import { DashboardView } from '@/components/figma/DashboardView';
import { AdvisorView } from '@/components/figma/AdvisorView';
import { ReportsView } from '@/components/figma/ReportsView';
import { InsightsView } from '@/components/figma/InsightsView';
import { SettingsView } from '@/components/figma/SettingsView';
import { OnboardingModal } from '@/components/figma/OnboardingModal';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<FigmaTab>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Horizontal Navigation Bar (as requested by user) */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">FounderSync</span>
            <span className="text-slate-300">·</span>
            <span>Industry 5.0 Human-Centric Strategic Mirror</span>
          </div>
          <p className="text-slate-400">
            Contradictory Advisor & Reality-Check Engine · AI never acts as autopilot
          </p>
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
