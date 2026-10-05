'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';

export function ConciergeView({ onNavigateToAdvisor }: { onNavigateToAdvisor?: () => void }) {
  const { user } = useAuth();
  const { userName } = useUserProfile();

  // Form State
  const [firstName, setFirstName] = useState(userName ? userName.split(' ')[0] : 'Venkata');
  const [lastName, setLastName] = useState(userName && userName.split(' ').length > 1 ? userName.split(' ').slice(1).join(' ') : 'Potluri');
  const [email, setEmail] = useState(user?.email || 'potluri.venkata2026@vitstudent.ac.in');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('8618331467');
  const [priority, setPriority] = useState<'routine' | 'strategic-urgent' | 'board-prep' | 'critical'>('strategic-urgent');
  const [message, setMessage] = useState(
    'We are preparing our Q4 Board Deck divergence model and need principal verification on our telemetry pipeline assumptions.'
  );

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inquiryDetails, setInquiryDetails] = useState<{ id: string; sla: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // FAQ Accordion Active Item (first item open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          countryCode,
          phone,
          priority,
          message,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsSuccess(true);
        setInquiryDetails({
          id: json.data.inquiryId,
          sla: json.data.sla,
        });
      } else {
        alert(json.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      alert('Network issue. Please try again or reach us directly at potluri.venkata2026@vitstudent.ac.in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      q: 'What differentiates FounderSync from standard AI copilots?',
      a: 'Unlike sycophantic chatbots optimized to agree with you, FounderSync functions as an adversarial dialectical sounding board. It actively pressure-tests board theses, interrogates unstated blindspots, and executes continuous contrarian validation on your operational telemetry.',
    },
    {
      q: 'How does the Contradictory Advisor evaluate hypotheses?',
      a: 'The Contradictory Advisor ingests historical board memorandums, telemetry data, and key executive assumptions, then simulates opposing stakeholder perspectives (skeptical venture partners, cynical engineering leads, or competing market incumbents) to locate fragility before it manifests.',
    },
    {
      q: 'Why should we choose zero-persistence sovereign enclaves?',
      a: 'Enterprise founders handle non-public material information, runway calibrations, and sensitive personnel changes. Our Zero-RAM sovereign hardware enclaves guarantee cryptographic isolation—no models are trained on your strategic payloads, and volatile memory is wiped immediately after synthesis.',
    },
    {
      q: 'What integrations does FounderSync support (Slack, Gong, Linear)?',
      a: 'FounderSync pairs natively via authenticated read-only webhooks into Slack executive channels, Gong client sentiment transcriptions, Linear engineering sprint velocity, and Salesforce deal slippage alerts to construct continuous real-time divergence health checks.',
    },
    {
      q: 'I am a solo tech founder. What tier should I start with?',
      a: 'Solo founders and early seed operators can begin with our Private Office tier, which offers automated contrarian sounding board sessions and direct concierge dispatch with under 2-hour priority turnaround for high-stakes decisions.',
    },
  ];

  return (
    <div className="flex flex-col w-full relative overflow-hidden text-slate-800 dark:text-[#E4E1E9]">
      {/* Ambient Luminary Glows (from Stitch Nocturne Luminary system) */}
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[620px] h-[520px] rounded-full bg-indigo-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-[700px] -right-20 w-[540px] h-[540px] rounded-full bg-purple-500/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-40 left-10 w-[460px] h-[400px] rounded-full bg-amber-500/5 blur-[130px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10 flex flex-col gap-12 sm:gap-16">
        
        {/* 1. HERO SECTION: GLIMPSE CONTACT US ADAPTATION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Side: Header & Direct Contact Info Blocks */}
          <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#1F1F24] border border-indigo-200/60 dark:border-white/10 w-fit shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#FFB95F] animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-[#C0C1FF] font-semibold">
                  Executive Concierge &amp; Sounding Board
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[48px] font-display font-bold tracking-tight text-slate-900 dark:text-[#F1F1F5]">
                How can we help you today?
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#C7C4D7] leading-relaxed font-sans">
                Our dedicated advisory and technical support team is just a message or call away. Direct asynchronous access for executive founders.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="flex flex-col gap-3">
              {/* Email Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1B20]/90 border border-slate-200/80 dark:border-white/10 hover:border-indigo-400 dark:hover:border-[#C0C1FF]/50 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group">
                <a
                  href="mailto:potluri.venkata2026@vitstudent.ac.in"
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#2A292F] flex items-center justify-center text-indigo-600 dark:text-[#C0C1FF] group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-[#908FA0]">Email</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#E4E1E9] truncate group-hover:text-indigo-600 dark:group-hover:text-[#C0C1FF] transition-colors">
                      potluri.venkata2026@vitstudent.ac.in
                    </span>
                  </div>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('potluri.venkata2026@vitstudent.ac.in', 'email')}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                  title="Copy email address"
                >
                  {copiedField === 'email' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Phone Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1B20]/90 border border-slate-200/80 dark:border-white/10 hover:border-purple-400 dark:hover:border-[#DDB7FF]/50 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group">
                <a
                  href="tel:+918618331467"
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#2A292F] flex items-center justify-center text-purple-600 dark:text-[#DDB7FF] group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-[#908FA0]">Mobile Number</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#E4E1E9] truncate group-hover:text-purple-600 dark:group-hover:text-[#DDB7FF] transition-colors">
                      +91 8618331467
                    </span>
                  </div>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('+918618331467', 'phone')}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                  title="Copy mobile number"
                >
                  {copiedField === 'phone' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Sovereign Node Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1B20]/90 border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-[#2A292F] flex items-center justify-center text-amber-600 dark:text-[#FFB95F] shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-[#908FA0]">Location / Sovereign Node</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#E4E1E9]">
                    Bangalore, Karnataka, India
                  </span>
                </div>
              </div>
            </div>

            {/* SLA Badge */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                Active Enclave Turnaround: <strong className="font-semibold">&lt; 2 Hours</strong> for verified executive founders.
              </p>
            </div>
          </div>

          {/* Right Side: Sleek Contact Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white/95 dark:bg-[#18181F]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative transition-all">
              
              {isSuccess ? (
                <div className="py-8 flex flex-col items-center text-center gap-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-sm">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-[#F1F1F5]">
                    Inquiry Dispatched to Sovereign Enclave
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#C7C4D7] max-w-md leading-relaxed">
                    Your hypothesis payload has been cryptographically isolated. The executive advisory unit will review your dialectical request within 2 hours.
                  </p>
                  {inquiryDetails && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#14141C] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-300 flex flex-col gap-1 w-full max-w-sm">
                      <div className="flex justify-between">
                        <span>Reference ID:</span>
                        <strong className="text-indigo-600 dark:text-indigo-300">{inquiryDetails.id}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Guaranteed SLA:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{inquiryDetails.sla}</strong>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setMessage('');
                    }}
                    className="mt-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#908FA0]">
                      Confidential Advisory Intake
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                      Zero-RAM Enclave
                    </span>
                  </div>

                  {/* First Name & Last Name (2 columns grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#C7C4D7]">
                        First name*
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Neeraj"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#0E0E13] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#E4E1E9] text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#C7C4D7]">
                        Last name*
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Babu"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#0E0E13] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#E4E1E9] text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#C7C4D7]">
                      Work email*
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@venture.co"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#0E0E13] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#E4E1E9] text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  {/* Phone Number with Country Code Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#C7C4D7]">
                      Direct Telephone*
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E0E13] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-11 px-3 bg-slate-100 dark:bg-[#2A292F] text-slate-800 dark:text-[#E4E1E9] text-xs font-mono border-r border-slate-200 dark:border-white/10 focus:outline-none cursor-pointer"
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+91">🇮🇳 +91</option>
                      </select>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full h-11 px-3.5 bg-transparent text-slate-900 dark:text-[#E4E1E9] text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Priority / Inquiry Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#C7C4D7]">
                      Deliberation Urgency / Topic
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'strategic-urgent', label: 'Urgent' },
                        { id: 'board-prep', label: 'Board Prep' },
                        { id: 'critical', label: 'Hypothesis' },
                        { id: 'routine', label: 'General' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPriority(p.id as any)}
                          className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            priority === p.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 dark:bg-[#14141C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message / Strategic Inquiry Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#C7C4D7]">
                      Strategic Hypothesis or Challenge*
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your strategic question, assumption divergence, or thesis..."
                      className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E0E13] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#E4E1E9] text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 flex flex-col gap-2.5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto self-start px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:shadow-[0_4px_28px_rgba(79,70,229,0.55)] transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Encrypting Payload...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Inquiry to Sovereign Enclave</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 2. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* FAQ Left Side */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-[#1F1F24] border border-purple-200/60 dark:border-white/10 w-fit">
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-700 dark:text-[#DDB7FF] font-semibold">
                Strategic FAQ
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-[#F1F1F5] tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#C7C4D7] leading-relaxed">
              Direct clarity on our adversarial dialectical models, Zero-RAM hardware enclaves, and sound boarding workflows.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-[#C0C1FF] hover:underline cursor-pointer"
              >
                <span>Launch Contradictory Advisor</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* FAQ Right Side: Accordion */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-[#1B1B20] border-indigo-400 dark:border-[#C0C1FF]/40 shadow-xs'
                      : 'bg-slate-50/80 dark:bg-[#14141C] border-slate-200/70 dark:border-white/5 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#E4E1E9] pr-4">
                      {item.q}
                    </span>
                    <span
                      className={`text-slate-400 dark:text-slate-400 transform transition-transform duration-200 shrink-0 font-bold ${
                        isOpen ? 'rotate-180 text-indigo-600 dark:text-[#C0C1FF]' : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-[#C7C4D7] leading-relaxed border-t border-slate-100 dark:border-white/5">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. BOTTOM VIBRANT GRADIENT BANNER CTA (Stitch Luminary Glimpse Adaptation) */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-14 shadow-[0_20px_50px_rgba(67,56,202,0.3)] bg-gradient-to-r from-[#4338CA] via-[#5E5CE6] to-[#8B5CF6] text-white">
          {/* Subtle Amber Glow Highlight */}
          <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-[#F59E0B]/20 blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-[#2C0051]/40 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center gap-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-snug">
              The strategic intelligence platform built to scale with your business
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
              Stop letting boardroom echo chambers make your critical capital allocation calls. Test every decision against contradictory reality.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-[#131318] text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Contact Concierge
              </button>
              <button
                type="button"
                onClick={onNavigateToAdvisor}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Explore Contradictory Advisor →
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
