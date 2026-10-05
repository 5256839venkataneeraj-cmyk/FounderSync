'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/figma/TopNavbar';
import { FaqView } from '@/components/figma/FaqView';
import { useUserProfile } from '@/context/UserProfileContext';

export default function FaqPage() {
  const router = useRouter();
  const { setActiveTab } = useUserProfile();

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] dark:bg-[#0F0F14] text-slate-900 dark:text-[#F1F1F5] flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <TopNavbar
        activeTab="faq"
        onTabChange={handleTabChange}
        onOpenOnboarding={() => {
          router.push('/login');
        }}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <FaqView
          onNavigateToConcierge={() => handleTabChange('concierge')}
          onNavigateToAdvisor={() => handleTabChange('advisor')}
        />
      </main>

      <footer className="bg-white dark:bg-[#14141C] border-t border-slate-200/80 dark:border-white/10 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-100">FounderSync</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <a
              href="mailto:potluri.venkata2026@vitstudent.ac.in"
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              potluri.venkata2026@vitstudent.ac.in
            </a>
            <span>•</span>
            <a
              href="tel:+918618331467"
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Direct Mobile: +91 8618331467 (Bangalore)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
