'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FounderSyncLogo } from '@/components/common/FounderSyncLogo';

/**
 * Maps Supabase raw error responses to friendly, user-facing error messages.
 * Guarantees that raw internal error strings are never exposed to the user.
 */
function formatAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const message = String(error.message || error).toLowerCase();
  const status = error.status;

  if (status === 429 || message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many emails sent. Please wait an hour or sign in with your password.';
  }
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (message.includes('password') && (message.includes('least') || message.includes('short') || message.includes('6'))) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network connection issue. Please check your internet connection.';
  }
  if (message.includes('supabase') && message.includes('not configured')) {
    return 'Authentication service is not configured.';
  }
  return 'Unable to process your request. Please try again or sign in with your password.';
}

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithPassword, signUp, resetPasswordForEmail } = useAuth();

  // Primary login mode: 'password' (default) vs secondary 'magic-link'
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password');
  // Sub-mode for password auth: 'signin' | 'signup' | 'forgot'
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const [email, setEmail] = useState('founder@venture.co');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 60-second cooldown timer for magic link dispatches
  const [magicLinkCooldown, setMagicLinkCooldown] = useState<number>(0);

  // Auto-redirect if already signed in
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  // Restore active cooldown across page refreshes
  useEffect(() => {
    try {
      const storedExpiry = sessionStorage.getItem('_fs_magic_cooldown_until');
      if (storedExpiry) {
        const remainingSeconds = Math.ceil((parseInt(storedExpiry, 10) - Date.now()) / 1000);
        if (remainingSeconds > 0) {
          setMagicLinkCooldown(remainingSeconds);
        } else {
          sessionStorage.removeItem('_fs_magic_cooldown_until');
        }
      }
    } catch {
      // Ignore sessionStorage access errors
    }
  }, []);

  // Interval ticker for magic link cooldown
  useEffect(() => {
    if (magicLinkCooldown <= 0) return;
    const interval = setInterval(() => {
      setMagicLinkCooldown((prev) => {
        if (prev <= 1) {
          try {
            sessionStorage.removeItem('_fs_magic_cooldown_until');
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [magicLinkCooldown]);

  const startCooldown = (seconds = 60) => {
    try {
      const expiry = Date.now() + seconds * 1000;
      sessionStorage.setItem('_fs_magic_cooldown_until', String(expiry));
    } catch {}
    setMagicLinkCooldown(seconds);
  };

  // Primary: Handle Password Sign In, Sign Up, or Password Reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    // 1. Forgot password flow
    if (mode === 'forgot') {
      setIsSubmitting(true);
      try {
        const { error } = await resetPasswordForEmail(trimmedEmail);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error));
        } else {
          setSuccessMessage('Password reset link sent! Please check your inbox.');
        }
      } catch (err: any) {
        setErrorMessage(formatAuthErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Password validation
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(trimmedEmail, password);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error));
        } else {
          setSuccessMessage('Authenticated successfully! Redirecting to workspace...');
          router.replace('/');
        }
      } else {
        // Sign Up
        const { error, session, user: newUser } = await signUp(trimmedEmail, password);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error));
        } else if (session) {
          setSuccessMessage('Account created! Redirecting to workspace...');
          router.replace('/');
        } else if (newUser) {
          setSuccessMessage('Account created! Please check your email to confirm registration.');
          setMode('signin');
        }
      }
    } catch (err: any) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Secondary: Handle Magic Link Dispatch with Rate Limit Protection
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (magicLinkCooldown > 0) {
      setErrorMessage(`Please wait ${magicLinkCooldown}s before requesting another link.`);
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    if (!supabase) {
      setErrorMessage('Authentication service is not configured.');
      return;
    }

    setIsSubmitting(true);
    try {
      const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: { emailRedirectTo },
      });

      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
        // Enforce cooldown if a rate limit error was encountered
        if (error.status === 429 || String(error.message).toLowerCase().includes('rate limit')) {
          startCooldown(60);
        }
      } else {
        setSuccessMessage('Magic Link sent! Please check your inbox to sign in.');
        startCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(formatAuthErrorMessage(err));
      if (String(err?.message).toLowerCase().includes('rate limit')) {
        startCooldown(60);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) return null;

  return (
    <main className="min-h-screen w-full bg-[#F8F9FD] flex flex-col items-center justify-center py-6 px-4 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows matching Figma Screen 1 */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(50% 50% at 50% 30%, rgba(224, 231, 255, 0.45) 0%, rgba(248, 249, 253, 0) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[350px] pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(254, 243, 199, 0.4) 0%, rgba(248, 249, 253, 0) 100%)',
        }}
      />

      <div className="w-full max-w-[420px] flex flex-col items-center relative z-10">
        {/* Top Logo Badge Container with Amber Status Dot */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center p-2.5 transition-transform hover:scale-105">
            <FounderSyncLogo variant="icon" className="h-10 w-auto" />
          </div>

          {/* Golden Amber Status Badge Dot */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#B8860B] border-2 border-white shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFE58F]" />
          </div>
        </div>

        {/* Dialectical Co-Pilot Pill Badge */}
        <div className="mb-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs">
            <svg className="w-2.5 h-2.5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>Dialectical Co-Pilot</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center mb-5">
          <h1 className="text-[30px] sm:text-[34px] font-serif font-bold text-slate-900 tracking-tight leading-[1.18]">
            Your strategic mirror, <br />
            <span className="italic text-[#4F46E5] font-serif font-bold">not your autopilot.</span>
          </h1>

          <p className="text-xs text-slate-500 max-w-[340px] mx-auto mt-2 leading-relaxed">
            Challenge assumptions, uncover blind spots, and lead with conviction.
          </p>
        </div>

        {/* Main Auth Card (Figma Screen 1 Styling) */}
        <div className="w-full bg-white rounded-[22px] border border-slate-100 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-start gap-2 animate-fadeIn">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <p className="flex-1 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2 animate-fadeIn">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <p className="flex-1 leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* PRIMARY FLOW: Email + Password */}
          {authMethod === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@venture.co"
                  className="w-full text-xs sm:text-sm bg-[#EEF2F9] border border-transparent focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[10.5px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm bg-[#EEF2F9] border border-transparent focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm bg-[#EEF2F9] border border-transparent focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4338CA] hover:bg-[#3730A3] active:scale-[0.99] disabled:bg-indigo-300 text-white text-xs sm:text-sm font-semibold py-2.5 sm:py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <span className="text-base leading-none">→</span>
                  </>
                )}
              </button>

              {/* Toggle Between Sign in and Create account */}
              <div className="flex justify-center items-center gap-1 text-[11.5px] font-medium text-slate-500 pt-1">
                {mode === 'signin' && (
                  <>
                    <span>Don&apos;t have an account?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer ml-1"
                    >
                      Create account
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <>
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer ml-1"
                    >
                      Sign in
                    </button>
                  </>
                )}
                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back to sign in
                  </button>
                )}
              </div>

              {/* Secondary Option: Email me a link instead */}
              <div className="pt-2 text-center border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('magic-link');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>✉️</span>
                  <span>Email me a link instead</span>
                </button>
              </div>
            </form>
          ) : (
            /* SECONDARY FLOW: Magic Link (Passwordless) with Rate Limit Handling */
            <form onSubmit={handleMagicLinkSubmit} className="space-y-3.5">
              <div className="flex justify-between items-center pb-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Passwordless Sign In
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('password');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Sign in with password instead
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@venture.co"
                  className="w-full text-xs sm:text-sm bg-[#EEF2F9] border border-transparent focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>

              {/* Magic link button with 60s cooldown state */}
              <button
                type="submit"
                disabled={isSubmitting || magicLinkCooldown > 0}
                className="w-full bg-[#4338CA] hover:bg-[#3730A3] active:scale-[0.99] disabled:bg-indigo-200 disabled:text-indigo-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold py-2.5 sm:py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sending magic link...</span>
                ) : magicLinkCooldown > 0 ? (
                  <span>Resend link in ({magicLinkCooldown}s)</span>
                ) : (
                  <>
                    <span>Continue with Magic Link</span>
                    <span className="text-base leading-none">→</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('password');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Return to password sign in
                </button>
              </div>
            </form>
          )}

          {/* Guarantees Row (Figma Screen 1) */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E58914]" />
              <span className="text-slate-600">Zero vanity metrics</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4338CA]" />
              <span className="text-slate-600">End-to-end confidential</span>
            </span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-slate-400 text-center mt-3.5 leading-relaxed">
          By signing in, you agree to our{' '}
          <span className="underline cursor-pointer hover:text-slate-600 transition-colors">Terms of Deliberation</span> and{' '}
          <span className="underline cursor-pointer hover:text-slate-600 transition-colors">Privacy Framework</span>.
        </p>

        {/* Testimonial Quote Callout Box (Figma Screen 1) */}
        <div className="w-full mt-3.5 p-3.5 bg-[#EEF2F9]/80 border border-slate-200/60 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-[#FDF0D5] border border-[#F6D896] text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-3.5 h-3.5 text-[#B8860B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <p className="text-[11.5px] text-slate-700 font-serif italic leading-relaxed">
            &ldquo;A critical sounding board ready before today&apos;s term sheet negotiations.&rdquo;
          </p>
        </div>
      </div>
    </main>
  );
}
