'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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

        {/* Floating Segmented Navigation Bar (No scrollbars, clean capsule) */}
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
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Utilities & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Input */}
          <div className="hidden xl:flex items-center relative">
            <span className="absolute left-3 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search assumptions..."
              className="w-40 2xl:w-48 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder:text-slate-400 rounded-full pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Notifications (1 unaddressed blind spot)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Co-Pilot Preview Trigger */}
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="hidden sm:inline-flex items-center text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs"
          >
            Co-Pilot Preview
          </button>

          {/* Auth State Controls */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 p-0.5 shadow-xs">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold uppercase">
                      {user.email ? user.email.slice(0, 2) : 'AC'}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1.5 ring-white"></span>
                </div>
                <div className="hidden 2xl:block text-left text-xs leading-tight">
                  <div className="font-bold text-slate-800 truncate max-w-[100px]" title={user.email || ''}>
                    {user.email?.split('@')[0] || 'Alex Chen'}
                  </div>
                  <div className="text-[9.5px] text-emerald-600 font-semibold">Online</div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
                className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 px-2.5 sm:px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                title="Sign out of current workspace"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-full shadow-xs transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
