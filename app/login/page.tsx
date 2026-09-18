'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithPassword, signUp, resetPasswordForEmail } = useAuth();

  const [authMethod, setAuthMethod] = useState<'magic-link' | 'password'>('magic-link');
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('founder@venture.co');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-redirect if already signed in
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    if (!supabase) {
      setErrorMessage('Supabase is not configured.');
      return;
    }
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) setErrorMessage(error.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate Google sign in.');
    }
  };

  // Handle Magic Link (Passwordless OTP)
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    if (!supabase) {
      setErrorMessage('Supabase is not configured.');
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
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Magic Link sent! Please check your inbox to sign in.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending magic link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Sign In / Sign Up / Forgot
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email.');
      return;
    }

    if (mode === 'forgot') {
      setIsSubmitting(true);
      try {
        const { error } = await resetPasswordForEmail(trimmedEmail);
        if (error) setErrorMessage(error.message);
        else setSuccessMessage('Password reset link sent! Check your inbox.');
      } catch (err: any) {
        setErrorMessage(err.message || 'Error resetting password.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(trimmedEmail, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Authenticated! Redirecting to workspace...');
          router.replace('/');
        }
      } else {
        const { error, session, user: newUser } = await signUp(trimmedEmail, password);
        if (error) {
          setErrorMessage(error.message);
        } else if (session) {
          setSuccessMessage('Account created! Redirecting to workspace...');
          router.replace('/');
        } else if (newUser) {
          setSuccessMessage('Account created! Check your email to confirm registration.');
          setMode('signin');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) return null;

  return (
    <main className="min-h-screen w-full bg-[#F8F9FD] flex flex-col items-center justify-center py-6 px-4 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Subtle Background Radial Ambient Glows matching Figma Screen 1 */}
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
        <div className="relative mb-3.5 flex items-center justify-center">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col items-center justify-center p-2 transition-transform hover:scale-105">
            {/* Stylized FounderSync Icon Emblem */}
            <div className="w-7 h-7 relative flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                <circle cx="16" cy="16" r="13" stroke="url(#fs-grad)" strokeWidth="2.5" strokeDasharray="6 3" />
                <path d="M12 16C12 13.7909 13.7909 12 16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="16" cy="16" r="2.5" fill="#E58914" />
                <defs>
                  <linearGradient id="fs-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" />
                    <stop offset="0.5" stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#E58914" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Wordmark under emblem */}
            <span className="text-[7.5px] font-extrabold tracking-tight text-slate-800 -mt-0.5">
              FounderSync
            </span>
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

        {/* Main Auth Card (Exact Figma Screen 1) */}
        <div className="w-full bg-white rounded-[22px] border border-slate-100 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-start gap-2 animate-fadeIn">
              <span className="text-rose-500 font-bold">✕</span>
              <p className="flex-1 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2 animate-fadeIn">
              <span className="text-emerald-600 font-bold">✓</span>
              <p className="flex-1 leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50/80 active:scale-[0.99] border border-slate-200/90 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider: OR EMAIL */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Or Email
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Primary Form: Magic Link (Exact Figma Screen 1 default) */}
          {authMethod === 'magic-link' ? (
            <form onSubmit={handleMagicLink} className="space-y-3.5">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4338CA] hover:bg-[#3730A3] active:scale-[0.99] disabled:bg-indigo-300 text-white text-xs sm:text-sm font-semibold py-2.5 sm:py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sending magic link...</span>
                ) : (
                  <>
                    <span>Continue with Magic Link</span>
                    <span className="text-base leading-none">→</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Secondary Password Mode (Accessible for local/dev fallback) */
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs font-bold text-slate-800">
                  {mode === 'signin' && 'Password Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('magic-link');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Switch to Magic Link
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@venture.co"
                  className="w-full text-xs bg-[#EEF2F9] border border-transparent focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all font-medium"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
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
                    className="w-full text-xs bg-[#EEF2F9] border border-transparent focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all font-medium"
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-[#EEF2F9] border border-transparent focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all font-medium"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4338CA] hover:bg-[#3730A3] active:scale-[0.99] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In to Workspace'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <span>→</span>
                  </>
                )}
              </button>

              <div className="flex justify-center gap-3 text-[11px] font-semibold text-slate-500 pt-0.5">
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Don&apos;t have an account? Create one
                  </button>
                )}
                {mode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Already registered? Sign in
                  </button>
                )}
                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back to sign in
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Guarantees Row (Exact Figma Screen 1) */}
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

        {/* Testimonial Quote Callout Box (Exact Figma Screen 1) */}
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

        {/* Optional dev shortcut to toggle password mode via small discrete key/link */}
        {authMethod === 'magic-link' && (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className="text-[10px] text-slate-400/60 hover:text-slate-500 transition-colors cursor-pointer"
            >
              (password fallback)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
