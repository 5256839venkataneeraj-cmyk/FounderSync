'use client';

import React, { useState } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';

export function GoogleCalendarModal() {
  const {
    isCalendarModalOpen,
    setIsCalendarModalOpen,
    currentDateFormatted,
    currentTimeFormatted,
    isCalendarConnected,
    calendarAccount,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    todayEvents,
    addCalendarEvent,
  } = useUserProfile();

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('3:00 PM - 3:45 PM');
  const [isAdding, setIsAdding] = useState(false);
  const [emailInput, setEmailInput] = useState(calendarAccount || '');

  if (!isCalendarModalOpen) return null;

  const handleCreateGoogleCalendarEvent = () => {
    const text = encodeURIComponent('FounderSync: Adversarial Reality-Check Sounding Board');
    const details = encodeURIComponent(
      'Automated session scheduled via FounderSync. Focus: Counter-deliberate Q4 roadmap and stress-test strategic assumptions with Gemini & Grok.'
    );
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`;
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    addCalendarEvent({
      title: newEventTitle.trim(),
      time: newEventTime,
      category: 'sounding-board',
    });
    setNewEventTitle('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1A1A22] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-2xs border border-blue-100 dark:border-blue-700/30">
              <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F1F1F5]">Google Calendar Integration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Daily synchronized strategic cadence · {currentDateFormatted}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCalendarModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Date & Real-time Sync Status */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-[#14141C] rounded-2xl p-4 border border-blue-100/80 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-0.5">
              Today&apos;s Active Calendar Window
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-[#F1F1F5]">
              {currentDateFormatted}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              System time: {currentTimeFormatted} · Updates automatically everyday
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCalendarConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Synced with Google</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-normal">
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Synchronized Events List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Sounding Board Schedule
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              {isAdding ? 'Cancel' : '+ Add Session'}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddCustomEvent} className="p-3 bg-slate-50 dark:bg-[#14141C] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2.5">
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Session title, e.g. Pre-Board Blind Spot Review"
                className="w-full text-xs bg-white dark:bg-[#1A1A22] text-slate-900 dark:text-[#F1F1F5] placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder="e.g. 3:00 PM - 3:45 PM"
                  className="w-1/2 text-xs bg-white dark:bg-[#1A1A22] text-slate-900 dark:text-[#F1F1F5] placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-1/2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2 rounded-xl"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {todayEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#14141C] border border-slate-200/80 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-xs transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-[#F1F1F5]">{evt.title}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{evt.time}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateGoogleCalendarEvent}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline shrink-0 font-semibold"
                  title="Open in Google Calendar"
                >
                  GCal ↗
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCreateGoogleCalendarEvent}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent dark:border-white/10"
          >
            <span>📅</span>
            <span>Open in Google Calendar</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isCalendarConnected ? (
              <button
                type="button"
                onClick={disconnectGoogleCalendar}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 px-3 py-2 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={() => connectGoogleCalendar()}
                className="text-xs font-bold text-white bg-[#4285F4] hover:bg-[#3367D6] px-4 py-2.5 rounded-xl shadow-xs transition-all"
              >
                Connect Account
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#2D31E3] hover:bg-[#2024B8] rounded-xl shadow-md transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleCalendarModal;
