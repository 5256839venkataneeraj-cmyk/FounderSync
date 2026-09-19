'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { FounderSyncLogo } from '@/components/common/FounderSyncLogo';

export type FigmaTab = 'dashboard' | 'advisor' | 'reports' | 'insights' | 'settings';

interface TopNavbarProps {
  activeTab: FigmaTab;
  onTabChange: (tab: FigmaTab) => void;
  onOpenOnboarding: () => void;
}

export function TopNavbar({ activeTab, onTabChange, onOpenOnboarding }: TopNavbarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { userName, setIsNameModalOpen, setIsCalendarModalOpen, isCalendarConnected } = useUserProfile();

  const tabs = [
    {
      id: 'dashboard' as FigmaTab,
      label: 'Dashboard',
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'advisor' as FigmaTab,
      label: 'Advisor',
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      id: 'reports' as FigmaTab,
      label: 'Reports',
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'insights' as FigmaTab,
      label: 'Insights',
      fullLabel: 'Team & Customer Insights',
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      id: 'settings' as FigmaTab,
      label: 'Settings',
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed top-3 inset-x-0 z-40 px-3 sm:px-6 flex justify-center pointer-events-none">
      <header className="pointer-events-auto w-full max-w-[1400px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 sm:gap-4 transition-all">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center cursor-pointer transition-transform hover:scale-102"
            onClick={() => onTabChange('dashboard')}
          >
            <FounderSyncLogo variant="horizontal" size="sm" />
          </div>
        </div>

        {/* Floating Segmented Navigation Bar */}
        <nav className="flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/60 shadow-inner shrink-0 overflow-x-auto no-scrollbar scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                title={tab.fullLabel || tab.label}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#2D31E3] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label === 'Insights' ? 'Team & Insights' : tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Utilities & User Profile as per Prototype */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:block h-4 w-px bg-slate-200" />

          {/* Search Pill: Search... ⌘K */}
          <div className="hidden xl:flex items-center relative">
            <span className="absolute left-3 text-slate-400 pointer-events-none">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-32 2xl:w-40 text-xs bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 rounded-full pl-8 pr-8 py-1 border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
            <span className="absolute right-2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
              ⌘K
            </span>
          </div>

          {/* Notification Bell with Amber Alert Dot */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Notifications (1 active contradiction)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Google Calendar Quick Pill */}
          <button
            type="button"
            onClick={() => setIsCalendarModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/70 rounded-full transition-all cursor-pointer shadow-2xs"
            title="Google Calendar Integration: Daily strategic sync"
          >
            <svg className="w-3.5 h-3.5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
            </svg>
            <span className={`w-1.5 h-1.5 rounded-full ${isCalendarConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[11px] font-medium hidden lg:inline">Calendar</span>
          </button>

          {/* Co-Pilot Preview Trigger */}
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="hidden sm:inline-flex items-center text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 px-3 py-1 rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Open Dialectical Co-Pilot Framework"
          >
            Co-Pilot
          </button>

          {/* Dynamic User Profile Pill */}
          <div className="flex items-center gap-1.5 pl-1">
            <div className="flex items-center gap-1 bg-slate-100/90 hover:bg-slate-200/80 pl-2 pr-1.5 py-1 rounded-full border border-slate-200/70 transition-all">
              <button
                type="button"
                onClick={() => setIsNameModalOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer text-left"
                title={`Founder: ${userName} (Click to edit name)`}
              >
                <img
                  src="/avatar-alex.png"
                  alt={userName}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300"
                />
                <span className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors">
                  {userName}
                </span>
                <svg className="w-3 h-3 text-slate-400 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Do you want to sign out?')) {
                      await signOut();
                      router.push('/login');
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors ml-0.5"
                  title="Sign out"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
