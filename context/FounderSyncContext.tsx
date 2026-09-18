'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import {
  AppState,
  Decision,
  DecisionAction,
  GrowthMetrics,
  HumanMetrics,
  ImbalanceResult,
  RealityCheckResult,
  StrategicAnalysisResult,
  StartupHealthScore,
} from '@/types';
import { SEED_APP_STATE } from '@/lib/mockData';
import { loadState, saveDecision, updateMetrics as updateStoreMetrics, resetToSeedData } from '@/lib/store';
import { calculateStartupHealthScore, calculateImbalance } from '@/lib/scoring';
import {
  isSupabaseConfigured,
  fetchWorkspaceMetrics,
  fetchWorkspaceDecisions,
  fetchWorkspaceHeatmap,
  fetchLatestStrategicAnalysis,
} from '@/lib/supabase';

interface FounderSyncContextValue {
  state: AppState;
  healthScore: StartupHealthScore;
  imbalanceResult: ImbalanceResult;
  // Gemini Strategic Analyst State
  isAnalyzingGemini: boolean;
  geminiError: string | null;
  runAnalysisGemini: (apiKey?: string) => Promise<StrategicAnalysisResult | null>;
  // Grok Reality-Check State
  activeStrategy: string;
  activeCritique: RealityCheckResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  setActiveStrategy: (strat: string) => void;
  runAnalysis: (strategy: string, apiKey?: string) => Promise<RealityCheckResult | null>;
  // Human-in-the-Loop Decision State
  recordDecision: (action: DecisionAction, justification: string) => { success: boolean; error?: string };
  // Metrics & Reset
  updateMetricsData: (growth?: Partial<GrowthMetrics>, human?: Partial<HumanMetrics>) => void;
  resetAll: () => void;
}

const FounderSyncContext = createContext<FounderSyncContextValue | undefined>(undefined);

export function FounderSyncProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(SEED_APP_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Gemini state machine
  const [isAnalyzingGemini, setIsAnalyzingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Grok state machine
  const [activeStrategy, setActiveStrategy] = useState('');
  const [activeCritique, setActiveCritique] = useState<RealityCheckResult | null>(null);
  const [activeRealityCheckId, setActiveRealityCheckId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Initialize from Supabase if configured, or fall back seamlessly to localStorage
  useEffect(() => {
    async function initData() {
      if (isSupabaseConfigured()) {
        try {
          const [metricsData, decisionsData, heatmapData, analysisData] = await Promise.all([
            fetchWorkspaceMetrics(),
            fetchWorkspaceDecisions(),
            fetchWorkspaceHeatmap(),
            fetchLatestStrategicAnalysis(),
          ]);

          if (metricsData && metricsData.length > 0) {
            const latest = metricsData[metricsData.length - 1];
            setState((prev) => ({
              ...prev,
              growthMetrics: {
                arr: Number(latest.arr),
                churnRate: Number(latest.churn_rate),
                ltv: Number(latest.ltv),
                burnRate: Number(latest.burn_rate),
              },
              humanMetrics: {
                burnoutIndex: Number(latest.team_burnout_index),
                customerTrustScore: Number(latest.customer_trust_score),
                founderCognitiveLoad: Number(latest.founder_cognitive_load),
                retentionSentiment: Number(latest.retention_sentiment),
              },
              decisions: decisionsData && decisionsData.length > 0 ? (decisionsData as any) : prev.decisions,
              heatmapScores: heatmapData
                ? {
                    marketFeasibility: heatmapData.market_feasibility,
                    teamSustainability: heatmapData.team_sustainability,
                    unitEconomics: heatmapData.unit_economics,
                    customerValue: heatmapData.customer_value,
                  }
                : prev.heatmapScores,
              activeStrategicAnalysis: analysisData
                ? {
                    summary: analysisData.summary || analysisData.market_position || '',
                    strengths: Array.isArray(analysisData.strengths) ? analysisData.strengths : [],
                    risks: Array.isArray(analysisData.risks)
                      ? analysisData.risks
                      : analysisData.sustainability_warning
                      ? [analysisData.sustainability_warning]
                      : [],
                    recommendations: Array.isArray(analysisData.recommendations)
                      ? analysisData.recommendations
                      : Array.isArray(analysisData.growth_opportunities)
                      ? analysisData.growth_opportunities
                      : [],
                    confidence: Number(analysisData.confidence) || 0.85,
                    model: analysisData.model || 'gemini-3.1-flash-lite',
                    simulated: Boolean(analysisData.simulated),
                    generatedAt: analysisData.created_at || new Date().toISOString(),
                  }
                : prev.activeStrategicAnalysis,
            }));
            setIsHydrated(true);
            return;
          }
        } catch (e) {
          console.warn('[FounderSync] Supabase init failed, using local store:', e);
        }
      }

      // Local fallback
      const loaded = loadState();
      setState(loaded);
      setIsHydrated(true);
    }

    initData();
  }, []);

  // Pure computed derived state
  const healthScore = useMemo(() => {
    return calculateStartupHealthScore(state.growthMetrics, state.humanMetrics);
  }, [state.growthMetrics, state.humanMetrics]);

  const imbalanceResult = useMemo(() => {
    return calculateImbalance(state.heatmapScores);
  }, [state.heatmapScores]);

  // Execute Gemini Strategic Analyst
  const runAnalysisGemini = async (apiKey?: string): Promise<StrategicAnalysisResult | null> => {
    setIsAnalyzingGemini(true);
    setGeminiError(null);

    try {
      const response = await fetch('/api/strategic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey?.trim() || undefined }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.error || `Server responded with status ${response.status}`);
      }

      const result: StrategicAnalysisResult = json.data;
      setState((prev) => ({ ...prev, activeStrategicAnalysis: result }));
      return result;
    } catch (err: any) {
      setGeminiError(err?.message || 'Failed to synthesize strategic analysis.');
      return null;
    } finally {
      setIsAnalyzingGemini(false);
    }
  };

  // Execute Grok Reality-Check
  const runAnalysis = async (strategy: string, apiKey?: string): Promise<RealityCheckResult | null> => {
    const trimmed = strategy.trim();
    if (!trimmed) {
      setAnalysisError('Please enter a strategy to stress-test.');
      return null;
    }

    if (trimmed.length < 10) {
      setAnalysisError('Strategy must be at least 10 characters long.');
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setActiveStrategy(trimmed);

    try {
      const response = await fetch('/api/reality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: trimmed, apiKey: apiKey?.trim() || undefined }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.error || `Server responded with status ${response.status}`);
      }

      const result: RealityCheckResult = json.data;
      setActiveCritique(result);
      if (json.realityCheckId) {
        setActiveRealityCheckId(json.realityCheckId);
      }
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Failed to complete reality check.';
      setAnalysisError(msg);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Record founder decision into persistent audit log
  const recordDecision = (
    action: DecisionAction,
    justification: string
  ): { success: boolean; error?: string } => {
    if (!activeCritique) {
      return { success: false, error: 'No active AI reality-check critique found to decide on.' };
    }

    const trimmedJustification = justification.trim();
    if (trimmedJustification.length < 20) {
      return {
        success: false,
        error: `Justification must be at least 20 characters (current: ${trimmedJustification.length}). Explain the rationale.`,
      };
    }

    const newDecision: Decision = {
      id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reality_check_id: activeRealityCheckId,
      action,
      justification: trimmedJustification,
      created_at: new Date().toISOString(),
      reality_checks: activeCritique,
    };

    const updated = saveDecision(newDecision);
    setState(updated);

    setActiveCritique(null);
    setActiveRealityCheckId(null);
    setActiveStrategy('');

    return { success: true };
  };

  const updateMetricsData = (
    growth?: Partial<GrowthMetrics>,
    human?: Partial<HumanMetrics>
  ) => {
    const updated = updateStoreMetrics(growth, human);
    setState(updated);
  };

  const resetAll = () => {
    const reset = resetToSeedData();
    setState(reset);
    setActiveCritique(null);
    setActiveStrategy('');
    setAnalysisError(null);
    setGeminiError(null);
  };

  const contextValue: FounderSyncContextValue = {
    state,
    healthScore,
    imbalanceResult,
    isAnalyzingGemini,
    geminiError,
    runAnalysisGemini,
    activeStrategy,
    activeCritique,
    isAnalyzing,
    analysisError,
    setActiveStrategy,
    runAnalysis,
    recordDecision,
    updateMetricsData,
    resetAll,
  };

  return (
    <FounderSyncContext.Provider value={contextValue}>
      {children}
    </FounderSyncContext.Provider>
  );
}

export function useFounderSync() {
  const context = useContext(FounderSyncContext);
  if (!context) {
    throw new Error('useFounderSync must be used within a FounderSyncProvider');
  }
  return context;
}
