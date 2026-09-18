// Pure, unit-testable business logic and scoring algorithms for FounderSync
import {
  GrowthMetrics,
  HumanMetrics,
  HeatmapScore,
  ImbalanceResult,
  StartupHealthScore,
} from '@/types';

/**
 * Normalizes a raw metric value into a 0-100 scale.
 * If invert is true, higher raw value produces a lower normalized score.
 */
export function normalizeValue(
  value: number,
  min: number,
  max: number,
  invert: boolean = false
): number {
  if (min === max) return 50;
  const clamped = Math.max(min, Math.min(max, value));
  const ratio = (clamped - min) / (max - min);
  const score = invert ? (1 - ratio) * 100 : ratio * 100;
  return Math.round(score * 10) / 10;
}

/**
 * Calculates the Startup Health Score (0-100).
 * Formula: 50% normalized Growth Metrics + 50% normalized Human Metrics.
 * 
 * Growth Metrics Normalization:
 * - ARR: scaled from $0 to $3,000,000 (higher is better) -> 30% of growth
 * - Churn Rate: scaled from 1% to 15% (inverted: lower is better) -> 30% of growth
 * - LTV: scaled from $1,000 to $50,000 (higher is better) -> 20% of growth
 * - Burn Rate: scaled from $10,000 to $200,000 (inverted: lower is better) -> 20% of growth
 * 
 * Human Metrics Normalization:
 * - Burnout Index: 0 to 100 (inverted: lower is better) -> 30% of human
 * - Customer Trust Score: 0 to 100 (higher is better) -> 30% of human
 * - Founder Cognitive Load: 0 to 100 (inverted: lower is better) -> 20% of human
 * - Retention Sentiment: 0 to 100 (higher is better) -> 20% of human
 */
export function calculateStartupHealthScore(
  growth: GrowthMetrics,
  human: HumanMetrics
): StartupHealthScore {
  // Normalize Growth Metrics
  const normARR = normalizeValue(growth.arr, 0, 3000000, false);
  const normChurn = normalizeValue(growth.churnRate, 1, 15, true);
  const normLTV = normalizeValue(growth.ltv, 1000, 50000, false);
  const normBurn = normalizeValue(growth.burnRate, 10000, 200000, true);

  const growthScoreNormalized = Math.round(
    normARR * 0.3 + normChurn * 0.3 + normLTV * 0.2 + normBurn * 0.2
  );

  // Normalize Human Metrics
  const normBurnout = normalizeValue(human.burnoutIndex, 0, 100, true);
  const normTrust = normalizeValue(human.customerTrustScore, 0, 100, false);
  const normCognitiveLoad = normalizeValue(human.founderCognitiveLoad, 0, 100, true);
  const normRetention = normalizeValue(human.retentionSentiment, 0, 100, false);

  const humanScoreNormalized = Math.round(
    normBurnout * 0.3 + normTrust * 0.3 + normCognitiveLoad * 0.2 + normRetention * 0.2
  );

  // Startup Health Score = 50% Growth + 50% Human
  const compositeScore = Math.round(growthScoreNormalized * 0.5 + humanScoreNormalized * 0.5);

  return {
    compositeScore,
    growthScoreNormalized,
    humanScoreNormalized,
    growthDetails: {
      arr: { raw: growth.arr, normalized: normARR, weight: 0.3, label: 'ARR' },
      churnRate: { raw: growth.churnRate, normalized: normChurn, weight: 0.3, label: 'Churn Rate' },
      ltv: { raw: growth.ltv, normalized: normLTV, weight: 0.2, label: 'LTV' },
      burnRate: { raw: growth.burnRate, normalized: normBurn, weight: 0.2, label: 'Burn Rate' },
    },
    humanDetails: {
      burnoutIndex: { raw: human.burnoutIndex, normalized: normBurnout, weight: 0.3, label: 'Team Burnout' },
      customerTrustScore: { raw: human.customerTrustScore, normalized: normTrust, weight: 0.3, label: 'Customer Trust' },
      founderCognitiveLoad: { raw: human.founderCognitiveLoad, normalized: normCognitiveLoad, weight: 0.2, label: 'Founder Load' },
      retentionSentiment: { raw: human.retentionSentiment, normalized: normRetention, weight: 0.2, label: 'Retention Sentiment' },
    },
  };
}

import { HeatmapQuadrant } from '@/types';

const QUADRANT_LABELS: Record<HeatmapQuadrant, string> = {
  marketFeasibility: 'Market Feasibility',
  teamSustainability: 'Team Sustainability',
  unitEconomics: 'Unit Economics',
  customerValue: 'Customer Value',
};

/**
 * Calculates imbalance across the 4 Echo-Chamber Matrix quadrants.
 * Imbalance rule: if (max-quadrant score − min-quadrant score) > 30,
 * flag an "over-indexed" alert naming the neglected quadrant.
 */
export function calculateImbalance(scores: HeatmapScore): ImbalanceResult {
  const quadrants: HeatmapQuadrant[] = [
    'marketFeasibility',
    'teamSustainability',
    'unitEconomics',
    'customerValue',
  ];

  let maxQuadrant: HeatmapQuadrant = quadrants[0];
  let minQuadrant: HeatmapQuadrant = quadrants[0];
  let maxScore: number = scores[maxQuadrant];
  let minScore: number = scores[minQuadrant];

  for (const q of quadrants) {
    const s = scores[q];
    if (s > maxScore) {
      maxScore = s;
      maxQuadrant = q;
    }
    if (s < minScore) {
      minScore = s;
      minQuadrant = q;
    }
  }

  const delta = Math.round((maxScore - minScore) * 10) / 10;
  const isImbalanced = delta > 30;

  return {
    isImbalanced,
    neglectedQuadrant: isImbalanced ? minQuadrant : null,
    neglectedQuadrantLabel: isImbalanced ? QUADRANT_LABELS[minQuadrant] : null,
    delta,
    maxScore,
    minScore,
    maxQuadrant,
    minQuadrant,
  };
}
