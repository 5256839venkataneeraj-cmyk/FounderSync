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
import { OnboardingModal } from '@/components/figma/OnboardingModal';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<FigmaTab>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Protected Route: redirect logged-out users to /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md animate-pulse">
            FS
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Synchronizing session credentials...
          </span>
        </div>
      </div>
    );
  }

  // If unauthenticated and redirecting, render placeholder
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
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
