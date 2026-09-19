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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-2xs">
              <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Calendar Integration</h3>
              <p className="text-xs text-slate-500">
                Daily synchronized strategic cadence · {currentDateFormatted}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCalendarModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Date & Real-time Sync Status */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white rounded-2xl p-4 border border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block mb-0.5">
              Today&apos;s Active Calendar Window
            </span>
            <div className="text-sm font-extrabold text-slate-900">
              {currentDateFormatted}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              System time: {currentTimeFormatted} · Updates automatically everyday
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCalendarConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Synced with Google</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Synchronized Events List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Sounding Board Schedule
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isAdding ? 'Cancel' : '+ Add Session'}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddCustomEvent} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Session title, e.g. Pre-Board Blind Spot Review"
                className="w-full text-xs bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder="e.g. 3:00 PM - 3:45 PM"
                  className="w-1/2 text-xs bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-xs transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{evt.time}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateGoogleCalendarEvent}
                  className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline shrink-0 font-semibold"
                  title="Open in Google Calendar"
                >
                  GCal ↗
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCreateGoogleCalendarEvent}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <span>📅</span>
            <span>Open in Google Calendar</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isCalendarConnected ? (
              <button
                type="button"
                onClick={disconnectGoogleCalendar}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 transition-colors"
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
