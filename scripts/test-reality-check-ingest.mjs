import assert from 'assert';
import { generateRealityCheckFromMetrics, ingestMetricsDocument } from '../lib/metricsIngestion.ts';

console.log('=== TESTING REALITY CHECK INGESTION & SYNTHESIS ===\n');

// Test 1: High Burn vs Low Retention Contradiction
console.log('[Test 1] High Burn Rate vs Low Retention Sentiment...');
const rc1 = generateRealityCheckFromMetrics({
  arr: 1440000,
  burn_rate: 75000,
  monthly_churn_rate: 4.2,
  clv: 21000,
  runway_months: 11,
  burnout_score: 45,
  trust_score: 80,
  cognitive_load_score: 55,
  retention_score: 64,
});

assert.strictEqual(rc1.reality_check_category, 'CONTRADICTION');
assert.ok(rc1.reality_check_question.includes('$75,000'), 'Question should reference burn rate');
assert.ok(rc1.reality_check_question.includes('64/100'), 'Question should reference retention score');
assert.ok(rc1.reality_check_description.includes('11 months'), 'Description should note 11 months runway');
console.log('✓ Test 1 Passed:', rc1.reality_check_question);

// Test 2: High Burnout / Overload vs Growth Targets
console.log('\n[Test 2] High Burnout & Cognitive Overload Warning...');
const rc2 = generateRealityCheckFromMetrics({
  arr: 2500000,
  burn_rate: 30000,
  monthly_churn_rate: 2.1,
  clv: 35000,
  runway_months: 28,
  burnout_score: 72,
  trust_score: 85,
  cognitive_load_score: 74,
  retention_score: 82,
});

assert.strictEqual(rc2.reality_check_category, 'WARNING');
assert.ok(rc2.reality_check_question.includes('72/100'), 'Question should mention 72/100 burnout');
assert.ok(rc2.reality_check_question.includes('74/100'), 'Question should mention 74/100 cognitive load');
console.log('✓ Test 2 Passed:', rc2.reality_check_question);

// Test 3: Document Ingestion returns reality check fields
console.log('\n[Test 3] Full Document Ingestion outputs Reality Check fields...');
const sampleDoc = `
Template: Template v1.0 — 2026-09
Company & Period
Company Name: Acme Cloud Inc.
Reporting Month: October 2026

Revenue Inputs
MRR: $100,000
Total Active Customers: 500
Monthly Revenue: $100,000

Churn Inputs
Customers Lost: 20
Starting Customers: 500

Customer Value Inputs
Avg Revenue Per Customer: $200

Burn & Runway Inputs
Monthly Expenses: $170,000
Cash In Bank: $700,000

Burnout Survey
Q1: 5\nQ2: 6\nQ3: 7\nQ4: 6\nQ5: 7\nQ6: 6\nQ7: 5\nQ8: 6\nQ9: 7\nQ10: 6

Trust Survey
Q1: 8\nQ2: 8\nQ3: 8\nQ4: 7\nQ5: 8\nQ6: 7\nQ7: 8\nQ8: 8\nQ9: 7\nQ10: 8

Cognitive Load Survey
Q1: 7\nQ2: 7\nQ3: 8\nQ4: 7\nQ5: 8\nQ6: 7\nQ7: 8\nQ8: 7\nQ9: 8\nQ10: 7

Retention Sentiment Survey
Q1: 6\nQ2: 6\nQ3: 6\nQ4: 5\nQ5: 6\nQ6: 6\nQ7: 6\nQ8: 5\nQ9: 6\nQ10: 6
`;

const ingestRes = ingestMetricsDocument(sampleDoc);
assert.strictEqual(ingestRes.status, 'ok');
assert.ok(ingestRes.calculated.reality_check_question, 'Should have reality_check_question');
assert.ok(ingestRes.calculated.reality_check_description, 'Should have reality_check_description');
assert.ok(ingestRes.calculated.reality_check_category, 'Should have reality_check_category');
console.log('✓ Test 3 Passed. Category:', ingestRes.calculated.reality_check_category);
console.log('  Question:', ingestRes.calculated.reality_check_question);
console.log('  Description:', ingestRes.calculated.reality_check_description);

console.log('\n=== ALL REALITY CHECK INGESTION TESTS PASSED! ===');
