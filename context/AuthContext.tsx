'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; user: User | null; session: Session | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const syncCookie = (token?: string, expiresIn = 3600) => {
  if (typeof document === 'undefined') return;
  if (token) {
    const secureFlag = window.location.protocol === 'https:' ? 'Secure;' : '';
    document.cookie = `sb-access-token=${token}; path=/; max-age=${expiresIn}; SameSite=Lax; ${secureFlag}`;
  } else {
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax;';
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1500);

    // 1. Initial Session Check on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      clearTimeout(fallbackTimeout);
      if (error) {
        console.warn('[Auth] Error getting initial session:', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        syncCookie(session.access_token, session.expires_in);
      }
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      clearTimeout(fallbackTimeout);
      console.warn('[Auth] Session check failed:', err);
      setLoading(false);
    });

    // 2. Real-time Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      clearTimeout(fallbackTimeout);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        syncCookie(session.access_token, session.expires_in);
      } else if (event === 'SIGNED_OUT') {
        syncCookie(undefined);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase client is not configured.', name: 'AuthError', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return {
        error: { message: 'Supabase client is not configured.', name: 'AuthError', status: 500 } as AuthError,
        user: null,
        session: null,
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
      },
    });
    return { error, user: data.user, session: data.session };
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return {
        error: {
          message: 'Supabase client is not configured.',
          name: 'AuthError',
          status: 500,
        } as AuthError,
      };
    }
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    syncCookie(undefined);
    if (!supabase) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return { error };
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase client is not configured.', name: 'AuthError', status: 500 } as AuthError };
    }
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login?reset=true` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
