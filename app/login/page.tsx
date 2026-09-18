'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithPassword, signUp, resetPasswordForEmail } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // 1. Forgot Password Mode
    if (mode === 'forgot') {
      setIsSubmitting(true);
      try {
        const { error } = await resetPasswordForEmail(trimmedEmail);
        if (error) {
          setErrorMessage(error.message || 'Failed to send password reset email.');
        } else {
          setSuccessMessage(
            'Password reset link sent! Check your inbox to set a new password.'
          );
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Sign In or Sign Up Validation
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
        // Sign in with password
        const { error } = await signInWithPassword(trimmedEmail, password);
        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMessage('Invalid email or password. Please try again or create an account.');
          } else {
            setErrorMessage(error.message);
          }
        } else {
          setSuccessMessage('Authentication successful! Redirecting to dashboard...');
          router.replace('/');
        }
      } else {
        // Sign up new user
        const { error, user: newUser, session } = await signUp(trimmedEmail, password);
        if (error) {
          setErrorMessage(error.message);
        } else if (session) {
          setSuccessMessage('Account created successfully! Redirecting...');
          router.replace('/');
        } else if (newUser && !session) {
          setSuccessMessage(
            'Account created! If email confirmation is enabled in your Supabase project, please check your inbox to verify your email before logging in.'
          );
          setMode('signin');
        } else {
          setSuccessMessage('Account registered! You can now sign in.');
          setMode('signin');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md">
          FS
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          FounderSync
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
          Contradictory Advisor & Reality-Check Operating System
        </p>

        {/* Mode Pill Toggle (Sign in vs Create account) */}
        {mode !== 'forgot' && (
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'signin' && 'Welcome back, Founder'}
              {mode === 'signup' && 'Create your FounderSync workspace'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signin' && 'Sign in with your email and password to access your dashboard.'}
              {mode === 'signup' && 'Register to synchronize metrics, stress-test assumptions, and break echo chambers.'}
              {mode === 'forgot' && 'Enter your email address to receive a secure recovery link.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-start gap-2 animate-fadeIn">
              <span className="text-rose-500 font-bold">✕</span>
              <p className="flex-1 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2 animate-fadeIn">
              <span className="text-emerald-600 font-bold">✓</span>
              <p className="flex-1 leading-relaxed">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@venture.co"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
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
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
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
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}

            {/* Confirm Password (only on Sign Up) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-99 disabled:bg-indigo-300 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In to Workspace'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Password Reset Link'}
                  </span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle / Back link for Forgot Password */}
          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto"
              >
                <span>← Back to Sign In</span>
              </button>
            </div>
          )}

          {/* Security & Industry 5.0 Trust Badges */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Encrypted Auth
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Supabase Scoped
            </span>
            <span>Zero Vanity Metrics</span>
          </div>
        </div>

        {/* Back to Site preview */}
        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
