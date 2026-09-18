// Verification script for pure scoring and business logic in FounderSync
import assert from 'node:assert';

// 1. Normalization helper logic
function normalizeValue(value, min, max, invert = false) {
  if (min === max) return 50;
  const clamped = Math.max(min, Math.min(max, value));
  const ratio = (clamped - min) / (max - min);
  const score = invert ? (1 - ratio) * 100 : ratio * 100;
  return Math.round(score * 10) / 10;
}

// 2. Health Score formula
function calculateStartupHealthScore(growth, human) {
  const normARR = normalizeValue(growth.arr, 0, 3000000, false);
  const normChurn = normalizeValue(growth.churnRate, 1, 15, true);
  const normLTV = normalizeValue(growth.ltv, 1000, 50000, false);
  const normBurn = normalizeValue(growth.burnRate, 10000, 200000, true);

  const growthScoreNormalized = Math.round(
    normARR * 0.3 + normChurn * 0.3 + normLTV * 0.2 + normBurn * 0.2
  );

  const normBurnout = normalizeValue(human.burnoutIndex, 0, 100, true);
  const normTrust = normalizeValue(human.customerTrustScore, 0, 100, false);
  const normCognitiveLoad = normalizeValue(human.founderCognitiveLoad, 0, 100, true);
  const normRetention = normalizeValue(human.retentionSentiment, 0, 100, false);

  const humanScoreNormalized = Math.round(
    normBurnout * 0.3 + normTrust * 0.3 + normCognitiveLoad * 0.2 + normRetention * 0.2
  );

  const compositeScore = Math.round(growthScoreNormalized * 0.5 + humanScoreNormalized * 0.5);

  return {
    compositeScore,
    growthScoreNormalized,
    humanScoreNormalized,
  };
}

// 3. Imbalance rule logic
function calculateImbalance(scores) {
  const quadrants = [
    'marketFeasibility',
    'teamSustainability',
    'unitEconomics',
    'customerValue',
  ];

  let maxQuadrant = quadrants[0];
  let minQuadrant = quadrants[0];
  let maxScore = scores[maxQuadrant];
  let minScore = scores[minQuadrant];

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
    delta,
    maxScore,
    minScore,
    maxQuadrant,
    minQuadrant,
  };
}

console.log('--- RUNNING FOUNDERSYNC PURE LOGIC TESTS ---');

// Test 1: Normalization bounds & inversion
console.log('Test 1: Normalization');
assert.strictEqual(normalizeValue(0, 0, 100, false), 0);
assert.strictEqual(normalizeValue(100, 0, 100, false), 100);
assert.strictEqual(normalizeValue(0, 0, 100, true), 100); // inverted
assert.strictEqual(normalizeValue(100, 0, 100, true), 0); // inverted
console.log('✓ Normalization passed');

// Test 2: Startup Health Score formula (50% growth / 50% human)
console.log('Test 2: Startup Health Score 50/50 weighting');
const sampleGrowth = { arr: 1500000, churnRate: 3.5, ltv: 25000, burnRate: 80000 };
const sampleHuman = { burnoutIndex: 65, customerTrustScore: 85, founderCognitiveLoad: 75, retentionSentiment: 65 };
const health = calculateStartupHealthScore(sampleGrowth, sampleHuman);

console.log(`  Calculated Health: Composite=${health.compositeScore}, Growth=${health.growthScoreNormalized}, Human=${health.humanScoreNormalized}`);
assert(health.compositeScore >= 0 && health.compositeScore <= 100, 'Score must be 0-100');
assert.strictEqual(
  health.compositeScore,
  Math.round(health.growthScoreNormalized * 0.5 + health.humanScoreNormalized * 0.5),
  'Must equal exact 50/50 blend'
);
console.log('✓ Health Score 50/50 formula passed');

// Test 3: Imbalance Rule (max - min > 30)
console.log('Test 3: Echo-Chamber Imbalance Detection');
// Imbalanced scenario: Market 86 vs Team 48 (delta = 38 > 30)
const imbalancedScores = {
  marketFeasibility: 86,
  teamSustainability: 48,
  unitEconomics: 74,
  customerValue: 82,
};
const imbRes = calculateImbalance(imbalancedScores);
console.log(`  Imbalanced case: delta=${imbRes.delta}, isImbalanced=${imbRes.isImbalanced}, neglected=${imbRes.neglectedQuadrant}`);
assert.strictEqual(imbRes.isImbalanced, true, 'Delta 38 should trigger imbalance');
assert.strictEqual(imbRes.neglectedQuadrant, 'teamSustainability', 'Should identify teamSustainability as neglected');
assert.strictEqual(imbRes.delta, 38);

// Balanced scenario: (max - min <= 30)
const balancedScores = {
  marketFeasibility: 75,
  teamSustainability: 65,
  unitEconomics: 70,
  customerValue: 80,
};
const balRes = calculateImbalance(balancedScores);
console.log(`  Balanced case: delta=${balRes.delta}, isImbalanced=${balRes.isImbalanced}`);
assert.strictEqual(balRes.isImbalanced, false, 'Delta 15 should be balanced');
assert.strictEqual(balRes.neglectedQuadrant, null);
console.log('✓ Imbalance rule passed');

console.log('ALL PURE LOGIC TESTS PASSED SUCCESSFULLY!');
