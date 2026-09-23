'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FounderSyncLogo } from '@/components/common/FounderSyncLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Maps Supabase raw error responses to friendly, user-facing error messages.
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
  return 'Unable to process your request. Please try again.';
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const { signInWithPassword, signUp, resetPasswordForEmail } = useAuth();

  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password');
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('founder@venture.co');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [magicLinkCooldown, setMagicLinkCooldown] = useState<number>(0);

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
    } catch {}
  }, [isOpen]);

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsSubmitting(true);
      try {
        const { error } = await resetPasswordForEmail(trimmedEmail);
        if (error) setErrorMessage(formatAuthErrorMessage(error));
        else setSuccessMessage('Password reset link sent! Check your inbox.');
      } catch (err: any) {
        setErrorMessage(formatAuthErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
      if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
        setErrorMessage('Password must contain at least one letter and one number.');
        return;
      }
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
          setErrorMessage(formatAuthErrorMessage(error));
        } else {
          setSuccessMessage('Authenticated successfully!');
          setTimeout(() => {
            onClose();
            router.refresh();
          }, 800);
        }
      } else {
        const { error, session, user: newUser } = await signUp(trimmedEmail, password);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error));
        } else if (session) {
          setSuccessMessage('Account created and logged in!');
          setTimeout(() => {
            onClose();
            router.refresh();
          }, 800);
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* SOLID, NON-TRANSPARENT MODAL CARD */}
      <div className="relative w-full max-w-[430px] bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-4.5 overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.35) 0%, rgba(255, 255, 255, 0) 75%)',
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
          {/* Top Logo Badge Container with Amber Status Dot */}
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center p-2">
              <FounderSyncLogo variant="icon" className="h-9 w-auto" />
            </div>

            {/* Amber Badge Dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#B8860B] border-2 border-white shadow-xs flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#FFE58F]" />
            </div>
          </div>

          {/* Dialectical Co-Pilot Pill Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF]">
              <svg className="w-2.5 h-2.5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>Dialectical Co-Pilot</span>
            </span>
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-[26px] sm:text-[28px] font-bold text-slate-900 tracking-tight leading-[1.2]">
              Your strategic mirror, <br />
              <span className="italic text-[#4F46E5] font-bold">not your autopilot.</span>
            </h2>

            <p className="text-xs font-normal text-slate-500 max-w-[320px] mx-auto mt-1.5 leading-relaxed">
              Challenge assumptions, uncover blind spots, and lead with conviction.
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-start gap-2 animate-fadeIn">
            <span className="text-rose-500 font-bold shrink-0">✕</span>
            <p className="flex-1 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2 animate-fadeIn">
            <span className="text-emerald-600 font-bold shrink-0">✓</span>
            <p className="flex-1 leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Form Container (Solid Opaque Box) */}
        <div className="bg-[#FAFBFD] border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3.5">
          {authMethod === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@venture.co"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-normal"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-normal"
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-normal"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4338CA] hover:bg-[#3730A3] active:scale-[0.99] disabled:bg-indigo-300 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
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
                    <span>→</span>
                  </>
                )}
              </button>

              <div className="flex justify-center items-center gap-1 text-[11px] font-medium text-slate-500 pt-0.5">
                {mode === 'signin' && (
                  <>
                    <span>Don&apos;t have an account?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMessage(null);
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
                    onClick={() => setMode('signin')}
                    className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back to sign in
                  </button>
                )}
              </div>

              <div className="pt-2 text-center border-t border-slate-200/60 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('magic-link');
                    setErrorMessage(null);
                  }}
                  className="text-[10.5px] font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>✉️</span>
                  <span>Email me a link instead</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
              <div className="flex justify-between items-center pb-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Passwordless Sign In
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('password');
                    setErrorMessage(null);
                  }}
                  className="text-[10.5px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Sign in with password instead
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@venture.co"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || magicLinkCooldown > 0}
                className="w-full bg-[#4338CA] hover:bg-[#3730A3] active:scale-[0.99] disabled:bg-indigo-200 disabled:text-indigo-400 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sending magic link...</span>
                ) : magicLinkCooldown > 0 ? (
                  <span>Resend link in ({magicLinkCooldown}s)</span>
                ) : (
                  <>
                    <span>Continue with Magic Link</span>
                    <span>→</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className="text-[10.5px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Return to password sign in
                </button>
              </div>
            </form>
          )}

          {/* Guarantees Row */}
          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10.5px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E58914]" />
              <span>Zero vanity metrics</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4338CA]" />
              <span>End-to-end confidential</span>
            </span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[10.5px] text-slate-400 text-center leading-relaxed">
          By signing in, you agree to our{' '}
          <span className="underline cursor-pointer hover:text-slate-600">Terms of Deliberation</span> and{' '}
          <span className="underline cursor-pointer hover:text-slate-600">Privacy Framework</span>.
        </p>

        {/* Testimonial Quote Callout Box (SOLID OPAQUE) */}
        <div className="p-3 bg-[#EEF2F9] border border-slate-200/80 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-6.5 h-6.5 rounded-full bg-[#FDF0D5] border border-[#F6D896] text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-3 h-3 text-[#B8860B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-700 font-serif italic leading-relaxed">
            &ldquo;A critical sounding board ready before today&apos;s term sheet negotiations.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
