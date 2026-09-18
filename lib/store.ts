// Typed Data Access Layer (DAL) for localStorage persistence in FounderSync
import { AppState, Decision, GrowthMetrics, HeatmapScore, HumanMetrics } from '@/types';
import { SEED_APP_STATE } from './mockData';

const STORAGE_KEY = 'foundersync_state_v1';

/**
 * Helper to safely test if localStorage is available in browser context.
 */
function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Loads the application state from localStorage.
 * If empty or corrupted, automatically seeds with realistic initial data.
 */
export function loadState(): AppState {
  if (!isClient()) {
    return SEED_APP_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic data on first load
      saveState(SEED_APP_STATE);
      return SEED_APP_STATE;
    }
    const parsed: AppState = JSON.parse(raw);
    
    // Ensure all critical top-level properties exist
    return {
      growthMetrics: parsed.growthMetrics || SEED_APP_STATE.growthMetrics,
      humanMetrics: parsed.humanMetrics || SEED_APP_STATE.humanMetrics,
      timeSeries: parsed.timeSeries || SEED_APP_STATE.timeSeries,
      heatmapScores: parsed.heatmapScores || SEED_APP_STATE.heatmapScores,
      decisions: parsed.decisions || SEED_APP_STATE.decisions,
      activeStrategicAnalysis: parsed.activeStrategicAnalysis || SEED_APP_STATE.activeStrategicAnalysis,
      lastActiveDecision: parsed.lastActiveDecision || null,
    };
  } catch (error) {
    console.error('[FounderSync DAL] Failed to parse localStorage state. Re-seeding defaults:', error);
    saveState(SEED_APP_STATE);
    return SEED_APP_STATE;
  }
}

/**
 * Saves the entire application state into localStorage.
 */
export function saveState(state: AppState): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[FounderSync DAL] Failed to persist state to localStorage:', error);
  }
}

/**
 * Appends a new Human-in-the-Loop Decision to the persistent audit log.
 * Also dynamically nudges the Echo-Chamber Heatmap scores based on the decision rationale.
 */
export function saveDecision(decision: Decision): AppState {
  const current = loadState();
  const updatedDecisions = [decision, ...current.decisions];

  // Nudge heatmap slightly based on decision action to reflect human feedback
  const updatedHeatmap: HeatmapScore = { ...current.heatmapScores };
  if (decision.action === 'PIVOT_STRATEGY') {
    // Pivoting to heed devil's advocate boosts team sustainability and unit economics
    updatedHeatmap.teamSustainability = Math.min(100, updatedHeatmap.teamSustainability + 4);
    updatedHeatmap.unitEconomics = Math.min(100, updatedHeatmap.unitEconomics + 2);
  } else {
    // Accepting & overriding increases market feasibility but consumes team bandwidth
    updatedHeatmap.marketFeasibility = Math.min(100, updatedHeatmap.marketFeasibility + 3);
    updatedHeatmap.teamSustainability = Math.max(0, updatedHeatmap.teamSustainability - 3);
  }

  const newState: AppState = {
    ...current,
    decisions: updatedDecisions,
    lastActiveDecision: decision,
    heatmapScores: updatedHeatmap,
  };

  saveState(newState);
  return newState;
}

/**
 * Retrieves the persisted list of past decisions (Audit Log).
 */
export function getDecisions(): Decision[] {
  return loadState().decisions;
}

/**
 * Updates Growth or Human metrics and persists changes.
 */
export function updateMetrics(
  growthUpdates?: Partial<GrowthMetrics>,
  humanUpdates?: Partial<HumanMetrics>
): AppState {
  const current = loadState();
  const newState: AppState = {
    ...current,
    growthMetrics: growthUpdates ? { ...current.growthMetrics, ...growthUpdates } : current.growthMetrics,
    humanMetrics: humanUpdates ? { ...current.humanMetrics, ...humanUpdates } : current.humanMetrics,
  };
  saveState(newState);
  return newState;
}

/**
 * Resets the application state back to default seed data.
 */
export function resetToSeedData(): AppState {
  saveState(SEED_APP_STATE);
  return SEED_APP_STATE;
}
