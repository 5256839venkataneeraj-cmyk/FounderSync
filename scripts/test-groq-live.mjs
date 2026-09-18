// Test live Groq reality check with user's key
import { runRealityCheckWithGrok } from '../lib/grok.js';

async function test() {
  console.log('Testing live Groq API call with key from .env.local...');
  const strategy = "We plan to double all subscription prices next month to increase ARR ahead of Series A.";

  const result = await runRealityCheckWithGrok(strategy, {
    arr: 1450000,
    churnRate: 3.8,
    ltv: 24500,
    burnRate: 85000,
  });

  console.log('\n--- GROQ REALITY CHECK RESULT ---');
  console.log('Model:', result.model);
  console.log('Simulated:', result.simulated);
  console.log('Verdict:', result.verdict);
  console.log('Counterarguments:', result.counterarguments);
  console.log('Blind spots:', result.blindSpots);
  console.log('Generated at:', result.generatedAt);

  if (result.simulated === false) {
    console.log('\n✓ SUCCESS: Live Groq model executed and returned genuine adversary critique!');
  } else {
    console.log('\nReturned mock simulation (check model name or network)');
  }
}

test().catch(console.error);
