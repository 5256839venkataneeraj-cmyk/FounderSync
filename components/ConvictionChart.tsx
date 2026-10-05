'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fetchWorkspaceMetrics, isSupabaseConfigured, supabase } from '@/lib/supabase';

export interface DataPoint {
  id: string;
  label: string; // e.g. 'May', 'Jun', 'Jul 28', 'Aug', 'Sep', 'Oct'
  fullDate: string;
  conviction: number; // 0 - 100
  market: number; // 0 - 100
  isInflection?: boolean;
  notes?: string;
}

// Baseline mock scenario reflecting the "Product Pivot Announcement" on July 28
const BASELINE_DATA: DataPoint[] = [
  {
    id: 'may',
    label: 'May',
    fullDate: 'May 15, 2024',
    conviction: 78,
    market: 32,
    notes: 'Founder optimism high; early customer churn rising unnoticed.',
  },
  {
    id: 'jun',
    label: 'Jun',
    fullDate: 'Jun 20, 2024',
    conviction: 85,
    market: 40,
    notes: 'Echo-chamber gap reaches 45%. Internal team heads down on features.',
  },
  {
    id: 'jul-pre',
    label: 'Jul 10',
    fullDate: 'Jul 10, 2024',
    conviction: 82,
    market: 48,
    notes: 'Advisory board flags cognitive burnout and misaligned pricing.',
  },
  {
    id: 'jul-pivot',
    label: 'Jul 28',
    fullDate: 'July 28, 2024',
    conviction: 70,
    market: 68,
    isInflection: true,
    notes: 'Key Inflection: Product Pivot Announcement to reality-check engine.',
  },
  {
    id: 'aug',
    label: 'Aug',
    fullDate: 'Aug 22, 2024',
    conviction: 74,
    market: 76,
    notes: 'Market reception jumps +28%. First 10 design partners onboarded.',
  },
  {
    id: 'sep',
    label: 'Sep',
    fullDate: 'Sep 18, 2024',
    conviction: 82,
    market: 83,
    notes: 'Convergence achieved: Team conviction validated by retention metrics.',
  },
  {
    id: 'oct',
    label: 'Oct',
    fullDate: 'Oct 25, 2024',
    conviction: 88,
    market: 86,
    notes: 'Durable alignment: Net revenue retention reaches 118%.',
  },
];

interface ConvictionChartProps {
  className?: string;
  initialSource?: 'auto' | 'mock' | 'supabase';
}

export function ConvictionChart({
  className = '',
  initialSource = 'auto',
}: ConvictionChartProps) {
  const [data, setData] = useState<DataPoint[]>(BASELINE_DATA);
  const [dataSource, setDataSource] = useState<'mock' | 'supabase'>('mock');
  const [supabaseRowCount, setSupabaseRowCount] = useState<number>(0);
  const [activeSeries, setActiveSeries] = useState<{ conviction: boolean; market: boolean }>({
    conviction: true,
    market: true,
  });
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [showInflectionModal, setShowInflectionModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG coordinate dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const padLeft = 55;
  const padRight = 55;
  const padTop = 45;
  const padBottom = 45;
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Supabase dynamic ingestion & Realtime Channel Subscription
  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    async function loadSupabaseMetrics() {
      if (initialSource === 'mock') {
        setData(BASELINE_DATA);
        setDataSource('mock');
        return;
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          setIsLoading(true);

          // 1. Get authenticated user ID if present
          let userId: string | null = null;
          try {
            const { data: userData } = await supabase.auth.getUser();
            userId = userData?.user?.id || null;
          } catch {}

          // 2. Query all historical rows from company_monthly_metrics ordered by created_at ascending
          let query = (supabase as any)
            .from('company_monthly_metrics')
            .select('*')
            .order('created_at', { ascending: true });

          if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
            query = query.eq('user_id', userId);
          }

          let { data: cmmRows, error: cmmError } = await query;

          // If query with user_id returned 0 rows, fallback to query without user_id filter
          if ((!cmmRows || cmmRows.length === 0) && userId) {
            const fallbackQuery = await (supabase as any)
              .from('company_monthly_metrics')
              .select('*')
              .order('created_at', { ascending: true });

            if (!fallbackQuery.error && fallbackQuery.data && fallbackQuery.data.length > 0) {
              cmmRows = fallbackQuery.data;
              cmmError = null;
            }
          }

          // Fallback to metrics table if company_monthly_metrics is empty
          let rawMetrics = cmmRows;
          if (!rawMetrics || rawMetrics.length === 0) {
            const fallbackMetrics = await fetchWorkspaceMetrics();
            if (fallbackMetrics && fallbackMetrics.length > 0) {
              rawMetrics = fallbackMetrics;
            }
          }

          if (isMounted && rawMetrics && rawMetrics.length > 0) {
            // Map chronological Supabase metric records into Conviction (Purple) & Market (Orange) series
            const mappedData: DataPoint[] = rawMetrics.map((row: any, idx: number) => {
              const burnout = Number(row.burnout_score ?? row.burnout_index ?? row.team_burnout_index ?? 50);
              const cognitive = Number(row.cognitive_load_score ?? row.founder_cognitive_load ?? 50);
              const trust = Number(row.trust_score ?? row.customer_trust_score ?? 50);
              const retention = Number(row.retention_score ?? row.retention_sentiment_score ?? row.retention_sentiment ?? 50);
              const churn = Number(row.churn_rate ?? row.monthly_churn_rate ?? 3);
              const compositeHealth = Number(row.composite_health_score ?? row.startup_health_score ?? 0);

              // Internal Conviction Curve (Purple):
              // Internal team conviction & alignment over time
              const calculatedConviction = compositeHealth > 0
                ? Math.round(Math.max(15, Math.min(100, compositeHealth)))
                : Math.round(Math.max(10, Math.min(100, 100 - (burnout * 0.45 + cognitive * 0.45) + 15)));

              // Market Reception Curve (Orange):
              // External market traction & customer reception
              const calculatedMarket = Math.round(
                Math.max(10, Math.min(100, (trust * 0.45 + retention * 0.45) + Math.max(0, 10 - churn)))
              );

              // Month label & date formatting
              const monthLabel = row.reporting_month
                ? row.reporting_month.split(' ')[0]
                : row.month || (row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short' }) : `M${idx + 1}`);

              const fullDateStr = row.created_at
                ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (row.reporting_month || monthLabel);

              // Designate inflection marker (Jul or mid-pivot)
              const isInflectionPoint =
                String(monthLabel).toLowerCase().includes('jul') ||
                (rawMetrics.length > 2 && idx === Math.floor(rawMetrics.length / 2)) ||
                (rawMetrics.length <= 2 && idx === rawMetrics.length - 1);

              return {
                id: row.id || `pt-${idx}`,
                label: isInflectionPoint && rawMetrics.length > 3 ? 'Jul 28' : monthLabel,
                fullDate: isInflectionPoint && rawMetrics.length > 3 ? 'July 28, 2024' : fullDateStr,
                conviction: calculatedConviction,
                market: calculatedMarket,
                isInflection: isInflectionPoint,
                notes: isInflectionPoint
                  ? 'Key Inflection: Product Pivot Announcement'
                  : `Metric Snapshot: Trust ${trust}/100, Retention ${retention}/100`,
              };
            });

            // Ensure at least one inflection point exists
            const hasInflection = mappedData.some((d) => d.isInflection);
            if (!hasInflection && mappedData.length > 0) {
              const midIdx = Math.floor(mappedData.length / 2);
              mappedData[midIdx].isInflection = true;
            }

            setData(mappedData);
            setDataSource('supabase');
            setSupabaseRowCount(mappedData.length);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[ConvictionChart] Supabase fetch error, using baseline scenario:', err);
        }
      }

      if (isMounted) {
        setData(BASELINE_DATA);
        setDataSource('mock');
        setIsLoading(false);
      }
    }

    // Initial load
    loadSupabaseMetrics();

    // Set up Real-Time Supabase Subscription on company_monthly_metrics
    if (isSupabaseConfigured() && supabase) {
      try {
        channel = supabase
          .channel('public:company_monthly_metrics')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'company_monthly_metrics',
            },
            (payload) => {
              console.log('[ConvictionChart] Realtime update from company_monthly_metrics:', payload);
              loadSupabaseMetrics();
            }
          )
          .subscribe((status) => {
            console.log('[ConvictionChart] Supabase Realtime channel status:', status);
          });
      } catch (subErr) {
        console.warn('[ConvictionChart] Realtime subscription notice:', subErr);
      }
    }

    // In-app custom event listener (fires immediately upon PDF ingestion without waiting on network socket)
    const handleIngestionSync = () => {
      console.log('[ConvictionChart] Ingested event detected, syncing live chart...');
      loadSupabaseMetrics();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('foundersync:metrics-ingested', handleIngestionSync);
      window.addEventListener('storage', handleIngestionSync);
    }

    return () => {
      isMounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('foundersync:metrics-ingested', handleIngestionSync);
        window.removeEventListener('storage', handleIngestionSync);
      }
    };
  }, [initialSource]);

  // Point mapping to SVG space
  const pointsWithCoords = useMemo(() => {
    if (!data.length) return [];
    return data.map((d, i) => {
      const x =
        data.length > 1
          ? padLeft + (i / (data.length - 1)) * chartWidth
          : padLeft + chartWidth / 2;
      const yConviction = padTop + chartHeight - (d.conviction / 100) * chartHeight;
      const yMarket = padTop + chartHeight - (d.market / 100) * chartHeight;
      return {
        ...d,
        x,
        yConviction,
        yMarket,
      };
    });
  }, [data, chartWidth, chartHeight, padLeft, padTop]);

  // Identify Inflection Point Coordinate
  const inflectionPoint = useMemo(() => {
    return pointsWithCoords.find((p) => p.isInflection) || pointsWithCoords[Math.floor(pointsWithCoords.length / 2)];
  }, [pointsWithCoords]);

  // Generate Smooth Cubic Spline / Bezier Path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) {
      if (pts.length === 1) {
        return `M ${(pts[0].x - 12).toFixed(1)} ${pts[0].y.toFixed(1)} L ${(pts[0].x + 12).toFixed(1)} ${pts[0].y.toFixed(1)}`;
      }
      return '';
    }
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  // Paths for Line Curves & Shaded Gradient Areas
  const convictionCurve = useMemo(() => {
    const coords = pointsWithCoords.map((p) => ({ x: p.x, y: p.yConviction }));
    return generateSmoothPath(coords);
  }, [pointsWithCoords]);

  const convictionArea = useMemo(() => {
    if (!pointsWithCoords.length) return '';
    const lastX = pointsWithCoords[pointsWithCoords.length - 1].x;
    const firstX = pointsWithCoords[0].x;
    const bottomY = padTop + chartHeight;
    return `${convictionCurve} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [convictionCurve, pointsWithCoords, padTop, chartHeight]);

  const marketCurve = useMemo(() => {
    const coords = pointsWithCoords.map((p) => ({ x: p.x, y: p.yMarket }));
    return generateSmoothPath(coords);
  }, [pointsWithCoords]);

  const marketArea = useMemo(() => {
    if (!pointsWithCoords.length) return '';
    const lastX = pointsWithCoords[pointsWithCoords.length - 1].x;
    const firstX = pointsWithCoords[0].x;
    const bottomY = padTop + chartHeight;
    return `${marketCurve} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [marketCurve, pointsWithCoords, padTop, chartHeight]);

  // Interactive Mouse Move for Scrubber & Crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !pointsWithCoords.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = svgWidth / rect.width;
    const currentSvgX = clientX * scaleX;

    // Find nearest point
    let nearest = pointsWithCoords[0];
    let minDiff = Infinity;
    for (const pt of pointsWithCoords) {
      const diff = Math.abs(pt.x - currentSvgX);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = pt;
      }
    }
    setHoveredPoint(nearest);
    setHoverX(nearest.x);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverX(null);
  };

  return (
    <div
      className={`glass-panel-elevated bg-white/90 dark:bg-[#14141C]/95 border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {/* Header & Meta Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-grotesk font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Metric in Focus
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {dataSource === 'supabase' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase Live ({supabaseRowCount} pts)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                ⚡ Model Scenario
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-[#F1F1F5] tracking-tight">
            Conviction Alignment vs. Market Reality
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal conviction versus external market feedback over time, pinpointing key strategic inflection.
          </p>
        </div>

        {/* Legend with Interactive Toggle & Filter Controls */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <button
            type="button"
            onClick={() =>
              setActiveSeries((prev) => ({
                ...prev,
                conviction: !prev.conviction,
              }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeSeries.conviction
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 opacity-60 line-through'
            }`}
            title="Click to toggle Internal Conviction curve"
          >
            <span className="w-3 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
            <span>Internal Conviction</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveSeries((prev) => ({
                ...prev,
                market: !prev.market,
              }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeSeries.market
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 opacity-60 line-through'
            }`}
            title="Click to toggle Market Reception curve"
          >
            <span className="w-3 h-1 rounded-full bg-amber-500"></span>
            <span>Market Reception</span>
          </button>

          {/* Pivot Story CTA Button */}
          <button
            type="button"
            onClick={() => setShowInflectionModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1E28] dark:hover:bg-[#252532] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 transition-colors"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">Pivot Details</span>
          </button>
        </div>
      </div>

      {/* Main Interactive SVG Chart Container */}
      <div className="relative pt-8 pb-3 select-none">
        {/* Floating Inflection Node Badge (Matching Figma Design) */}
        {inflectionPoint && (
          <div
            onClick={() => setShowInflectionModal(true)}
            className="absolute top-1 z-20 cursor-pointer transform -translate-x-1/2 transition-all hover:scale-105"
            style={{ left: `${(inflectionPoint.x / svgWidth) * 100}%` }}
          >
            <div className="bg-white/95 dark:bg-[#1A1A24]/95 backdrop-blur-md border border-amber-300 dark:border-amber-500/50 shadow-lg hover:shadow-amber-500/20 rounded-2xl px-3.5 py-1.5 text-center flex items-center gap-2.5 transition-all">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <div className="text-left">
                <div className="text-[10px] font-grotesk font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Key Inflection · Jul 28
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-[#F1F1F5] flex items-center gap-1">
                  <span>Product Pivot Announcement</span>
                  <span className="text-[10px] text-amber-500">↗</span>
                </div>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 text-sm ml-0.5">🎯</span>
            </div>
          </div>
        )}

        {/* Hover Crosshair Info Pill (Displays when mouse scrubbing) */}
        {hoveredPoint && hoverX !== null && (
          <div
            className="absolute top-2 z-30 pointer-events-none transform -translate-x-1/2 transition-transform duration-75 ease-out"
            style={{ left: `${(hoverX / svgWidth) * 100}%` }}
          >
            <div className="bg-slate-900/95 dark:bg-black/90 backdrop-blur-md text-white border border-slate-700 dark:border-white/20 shadow-2xl rounded-2xl px-3 py-1.5 text-xs flex items-center gap-3">
              <div className="font-bold text-slate-300 border-r border-slate-700 pr-2">
                {hoveredPoint.label}
              </div>
              {activeSeries.conviction && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span className="font-semibold text-indigo-200">
                    {hoveredPoint.conviction}%
                  </span>
                </div>
              )}
              {activeSeries.market && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="font-semibold text-amber-200">
                    {hoveredPoint.market}%
                  </span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 pl-1 border-l border-slate-700">
                Δ{' '}
                <span
                  className={
                    hoveredPoint.conviction > hoveredPoint.market + 15
                      ? 'text-rose-400 font-bold'
                      : 'text-emerald-400 font-bold'
                  }
                >
                  {hoveredPoint.conviction - hoveredPoint.market > 0 ? '+' : ''}
                  {hoveredPoint.conviction - hoveredPoint.market}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Scalable SVG Canvas */}
        <div className="w-full h-64 sm:h-72">
          <svg
            ref={svgRef}
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Purple/Indigo Gradient for Internal Conviction Area */}
              <linearGradient id="purpleGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.28" />
                <stop offset="50%" stopColor="#6366F1" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.00" />
              </linearGradient>

              {/* Orange/Amber Gradient for Market Reception Area */}
              <linearGradient id="orangeGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.00" />
              </linearGradient>

              {/* Glowing Drop-Shadow Filters for Nodes */}
              <filter id="glowPurple" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glowOrange" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Grid Guide Lines */}
            <g className="text-slate-100 dark:text-white/5">
              <line
                x1={padLeft}
                y1={padTop}
                x2={svgWidth - padRight}
                y2={padTop}
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={padLeft}
                y1={padTop + chartHeight * 0.33}
                x2={svgWidth - padRight}
                y2={padTop + chartHeight * 0.33}
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={padLeft}
                y1={padTop + chartHeight * 0.66}
                x2={svgWidth - padRight}
                y2={padTop + chartHeight * 0.66}
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={padLeft}
                y1={padTop + chartHeight}
                x2={svgWidth - padRight}
                y2={padTop + chartHeight}
                stroke="currentColor"
                strokeWidth="1"
              />
            </g>

            {/* Vertical Inflection Guide Line at Jul 28 */}
            {inflectionPoint && (
              <g className="inflection-guideline">
                <line
                  x1={inflectionPoint.x}
                  y1={padTop - 10}
                  x2={inflectionPoint.x}
                  y2={padTop + chartHeight}
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeOpacity="0.8"
                />
                <circle
                  cx={inflectionPoint.x}
                  cy={padTop + chartHeight}
                  r="3.5"
                  fill="#F59E0B"
                />
              </g>
            )}

            {/* Dynamic Scrubber Crosshair on Hover */}
            {hoverX !== null && (
              <line
                x1={hoverX}
                y1={padTop}
                x2={hoverX}
                y2={padTop + chartHeight}
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                strokeOpacity="0.6"
              />
            )}

            {/* Filled Shaded Area 1: Internal Conviction (Purple) */}
            {activeSeries.conviction && convictionArea && (
              <path
                d={convictionArea}
                fill="url(#purpleGradientArea)"
                className="transition-opacity duration-300"
              />
            )}

            {/* Filled Shaded Area 2: Market Reception (Orange) */}
            {activeSeries.market && marketArea && (
              <path
                d={marketArea}
                fill="url(#orangeGradientArea)"
                className="transition-opacity duration-300"
              />
            )}

            {/* Stroke Curve 1: Internal Conviction (Purple) */}
            {activeSeries.conviction && convictionCurve && (
              <path
                d={convictionCurve}
                fill="none"
                stroke="#6366F1"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
              />
            )}

            {/* Stroke Curve 2: Market Reception (Orange) */}
            {activeSeries.market && marketCurve && (
              <path
                d={marketCurve}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]"
              />
            )}

            {/* Data Point Nodes */}
            {pointsWithCoords.map((pt) => (
              <g key={pt.id} className="cursor-pointer">
                {/* Purple node */}
                {activeSeries.conviction && (
                  <circle
                    cx={pt.x}
                    cy={pt.yConviction}
                    r={hoveredPoint?.id === pt.id ? 6 : 4}
                    fill="#6366F1"
                    stroke="#FFFFFF"
                    strokeWidth={hoveredPoint?.id === pt.id ? 2.5 : 1.5}
                    className="transition-all duration-150"
                  />
                )}
                {/* Orange node */}
                {activeSeries.market && (
                  <circle
                    cx={pt.x}
                    cy={pt.yMarket}
                    r={hoveredPoint?.id === pt.id ? 6 : 4}
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth={hoveredPoint?.id === pt.id ? 2.5 : 1.5}
                    className="transition-all duration-150"
                  />
                )}
              </g>
            ))}

            {/* Distinct Glowing Node at Key Inflection Point */}
            {inflectionPoint && (
              <g
                className="inflection-hero-node cursor-pointer group"
                onClick={() => setShowInflectionModal(true)}
              >
                {/* Outer Pulse Glow Ring */}
                <circle
                  cx={inflectionPoint.x}
                  cy={inflectionPoint.yConviction}
                  r="14"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeOpacity="0.75"
                  className="animate-pulse"
                />
                <circle
                  cx={inflectionPoint.x}
                  cy={inflectionPoint.yConviction}
                  r="20"
                  fill="#F59E0B"
                  fillOpacity="0.12"
                />
                {/* Core Dual-Accent Marker */}
                <circle
                  cx={inflectionPoint.x}
                  cy={inflectionPoint.yConviction}
                  r="7.5"
                  fill="#6366F1"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  filter="url(#glowPurple)"
                />
                <circle
                  cx={inflectionPoint.x}
                  cy={inflectionPoint.yConviction}
                  r="4"
                  fill="#FCD34D"
                />
              </g>
            )}
          </svg>
        </div>

        {/* X-Axis Months Legend (Figma Screen 2) */}
        <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 px-6 pt-3 border-t border-slate-100 dark:border-white/10">
          {pointsWithCoords.map((pt) => {
            const isInf = pt.isInflection;
            return (
              <span
                key={pt.id}
                onClick={() => isInf && setShowInflectionModal(true)}
                className={`transition-colors ${
                  isInf
                    ? 'font-bold text-amber-600 dark:text-amber-400 cursor-pointer underline decoration-amber-400/50 decoration-2 underline-offset-4'
                    : hoveredPoint?.id === pt.id
                    ? 'font-bold text-slate-800 dark:text-slate-200'
                    : 'hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {pt.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Strategic Callout / Impact Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-white/10">
        <div className="bg-slate-50 dark:bg-[#1A1A22] rounded-2xl p-4 border border-slate-200/70 dark:border-white/5 space-y-1">
          <span className="text-[10px] font-grotesk font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Pre-Pivot Gap (May–Jun)
          </span>
          <div className="text-lg font-metric font-bold text-rose-600 dark:text-rose-400">
            +45% Divergence
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High internal optimism with lagging customer engagement signals.
          </p>
        </div>

        <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-200/80 dark:border-amber-500/20 space-y-1">
          <span className="text-[10px] font-grotesk font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Jul 28 Inflection
          </span>
          <div className="text-lg font-metric font-bold text-amber-600 dark:text-amber-300">
            Alignment Convergence
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Strategy reset from generic workflows to reality-check engine.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-[#1A1A22] rounded-2xl p-4 border border-slate-200/70 dark:border-white/5 space-y-1">
          <span className="text-[10px] font-grotesk font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Post-Pivot Traction (Aug–Oct)
          </span>
          <div className="text-lg font-metric font-bold text-emerald-600 dark:text-emerald-400">
            +38% Trust Lift
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Validated PMF: Market reception matched team conviction at 86%.
          </p>
        </div>
      </div>

      {/* Interactive Inflection Pivot Detail Modal / Popover */}
      {showInflectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1A1A24] rounded-3xl border border-amber-300/80 dark:border-amber-500/40 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/20">
                  🎯
                </span>
                <div>
                  <span className="text-[10px] font-grotesk font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Key Strategic Inflection · July 28
                  </span>
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-[#F1F1F5]">
                    Product Pivot Announcement
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInflectionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#22222E] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p>
                Prior to July 28, the team operated under high internal conviction (85%)
                while external market traction lagged at 40%. The Devil’s Advocate advisor
                flagged enterprise churn risk and founder burnout.
              </p>

              <div className="bg-slate-50 dark:bg-[#14141C] rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 space-y-2.5">
                <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Verified Metric Shifts:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1E28] border border-slate-200/70 dark:border-white/5">
                    <span className="text-slate-400 block text-[10px]">Team Burnout Index</span>
                    <span className="text-rose-500 line-through mr-1 font-bold">74</span>
                    <span className="text-emerald-500 font-bold">→ 68 (-6 pts)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1E28] border border-slate-200/70 dark:border-white/5">
                    <span className="text-slate-400 block text-[10px]">Customer Trust Score</span>
                    <span className="text-amber-500 line-through mr-1 font-bold">59</span>
                    <span className="text-emerald-500 font-bold">→ 83 (+24 pts)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                “The pivot to an adversarial reality-check mirror broke our echo chamber and
                directly aligned internal building with genuine customer retention.”
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowInflectionModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Close Inflection Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConvictionChart;
