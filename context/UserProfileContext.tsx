'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

import { FigmaTab } from '@/lib/types';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  category: 'sounding-board' | 'deliberation' | 'investor' | 'team';
  link?: string;
}

interface UserProfileContextValue {
  userName: string;
  updateUserName: (name: string) => void;
  isNameModalOpen: boolean;
  setIsNameModalOpen: (open: boolean) => void;
  greeting: string;
  currentDateFormatted: string;
  currentTimeFormatted: string;
  isCalendarConnected: boolean;
  calendarAccount: string | null;
  connectGoogleCalendar: (accountEmail?: string) => void;
  disconnectGoogleCalendar: () => void;
  isCalendarModalOpen: boolean;
  setIsCalendarModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  activeTab: FigmaTab;
  setActiveTab: (tab: FigmaTab) => void;
  todayEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Q4 Enterprise Pricing Counter-Deliberation',
    time: '10:30 AM - 11:15 AM',
    category: 'sounding-board',
  },
  {
    id: 'evt-2',
    title: 'Customer Advisory Board: Friction Notes',
    time: '2:00 PM - 2:45 PM',
    category: 'deliberation',
  },
  {
    id: 'evt-3',
    title: 'Executive Reflection & AI Reality-Check Signoff',
    time: '4:30 PM - 5:00 PM',
    category: 'team',
  },
];

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // 1. User name management
  const [userName, setUserNameState] = useState<string>('Alex');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  // 2. Navigation & Command Palette Search Modal
  const [activeTab, setActiveTab] = useState<FigmaTab>('dashboard');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global Command+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Real-time Date and Greeting
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>('Good morning');

  // 3. Google Calendar Integration
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(true);
  const [calendarAccount, setCalendarAccount] = useState<string | null>('founder@venturesync.co');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>(DEFAULT_CALENDAR_EVENTS);

  // 4. Stitch Nocturne Luminary Dark Mode Theme
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('foundersync_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Hydrate userName and theme from localStorage or Auth
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply Nocturne Luminary dark mode theme
    const storedTheme = localStorage.getItem('foundersync_theme') as 'dark' | 'light' | null;
    const initialTheme = storedTheme || 'dark';
    setThemeState(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    const storedName = localStorage.getItem('foundersync_user_name');
    if (storedName && storedName.trim()) {
      setUserNameState(storedName.trim());
    } else if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      const capitalized = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      setUserNameState(capitalized);
    } else {
      // First time visitor prompt
      const hasPrompted = localStorage.getItem('foundersync_name_prompted');
      if (!hasPrompted) {
        setIsNameModalOpen(true);
        localStorage.setItem('foundersync_name_prompted', 'true');
      }
    }

    const storedCal = localStorage.getItem('foundersync_gcal_connected');
    if (storedCal !== null) {
      setIsCalendarConnected(storedCal === 'true');
    }
    const storedCalAcct = localStorage.getItem('foundersync_gcal_account');
    if (storedCalAcct) {
      setCalendarAccount(storedCalAcct);
    }

    const storedEvents = localStorage.getItem('foundersync_today_events');
    if (storedEvents) {
      try {
        setTodayEvents(JSON.parse(storedEvents));
      } catch {
        // use default
      }
    }

    setIsInitialCheckDone(true);
  }, [user]);

  // Update clock & greeting dynamically every minute
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      setCurrentDate(now);

      const hour = now.getHours();
      if (hour < 12) {
        setGreeting('Good morning');
      } else if (hour < 17) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };

    updateTimeAndGreeting();
    const timer = setInterval(updateTimeAndGreeting, 30000); // 30 sec tick
    return () => clearInterval(timer);
  }, []);

  const updateUserName = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setUserNameState(cleanName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('foundersync_user_name', cleanName);
    }
  };

  const connectGoogleCalendar = (accountEmail?: string) => {
    const email = accountEmail || user?.email || 'founder@venturesync.co';
    setIsCalendarConnected(true);
    setCalendarAccount(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('foundersync_gcal_connected', 'true');
      localStorage.setItem('foundersync_gcal_account', email);
    }
  };

  const disconnectGoogleCalendar = () => {
    setIsCalendarConnected(false);
    setCalendarAccount(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('foundersync_gcal_connected', 'false');
      localStorage.removeItem('foundersync_gcal_account');
    }
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = { ...event, id: `evt-${Date.now()}` };
    const updated = [...todayEvents, newEvt];
    setTodayEvents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('foundersync_today_events', JSON.stringify(updated));
    }
  };

  // Format today's date dynamically (e.g., "Tuesday, October 24" or actual today)
  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(currentDate);

  const currentTimeFormatted = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(currentDate);

  return (
    <UserProfileContext.Provider
      value={{
        userName,
        updateUserName,
        isNameModalOpen,
        setIsNameModalOpen,
        greeting,
        currentDateFormatted,
        currentTimeFormatted,
        isCalendarConnected,
        calendarAccount,
        connectGoogleCalendar,
        disconnectGoogleCalendar,
        isCalendarModalOpen,
        setIsCalendarModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        activeTab,
        setActiveTab,
        todayEvents,
        addCalendarEvent,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return ctx;
}
