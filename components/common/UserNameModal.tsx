'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';

export function UserNameModal() {
  const { userName, updateUserName, isNameModalOpen, setIsNameModalOpen, greeting } = useUserProfile();
  const [inputVal, setInputVal] = useState(userName);

  useEffect(() => {
    if (isNameModalOpen) {
      setInputVal(userName);
    }
  }, [isNameModalOpen, userName]);

  if (!isNameModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      updateUserName(inputVal.trim());
      setIsNameModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 transform transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              👤
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Founder Profile</h3>
              <p className="text-xs text-slate-500 font-normal">Personalize your executive sounding board</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNameModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              What is your name?
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. Alex, Maya, Neeraj"
              autoFocus
              className="w-full text-sm font-semibold bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-100 flex items-center gap-3">
            <span className="text-lg">✨</span>
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Dashboard Greeting Preview:</span>
              <div className="text-indigo-900 font-bold text-sm">
                {greeting}, {inputVal.trim() || 'Alex'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNameModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2D31E3] hover:bg-[#2024B8] active:scale-98 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save &amp; Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserNameModal;
