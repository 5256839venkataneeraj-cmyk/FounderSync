// Automated test script for Dual-AI endpoints (Gemini Strategic Analyst + Grok/Groq Reality Check)

async function testDualAI() {
  console.log('--- TESTING DUAL-AI ENDPOINTS ---');

  const headers = {
    'Content-Type': 'application/json',
    'x-user-session': 'founder-workspace-session',
  };

  // 1. Test POST /api/strategic-analysis (Gemini)
  console.log('\n1. Testing POST /api/strategic-analysis (Gemini Strategic Analyst)...');
  const stratRes = await fetch('http://localhost:3000/api/strategic-analysis', {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  console.log(`Strategic Analysis HTTP Status: ${stratRes.status}`);
  const stratJson = await stratRes.json();
  console.log('Strategic Analysis Result:\n', JSON.stringify(stratJson, null, 2));

  if (!stratJson.success || !stratJson.data) {
    throw new Error(`Strategic Analysis call failed: ${stratJson.error || 'Unknown error'}`);
  }

  const stratData = stratJson.data;
  if (
    typeof stratData.summary === 'string' &&
    Array.isArray(stratData.strengths) &&
    Array.isArray(stratData.risks) &&
    Array.isArray(stratData.recommendations) &&
    typeof stratData.confidence === 'number' &&
    typeof stratData.simulated === 'boolean'
  ) {
    console.log('✓ Gemini Strategic Analyst route passed verification!');
  } else {
    throw new Error('Strategic Analysis response does not match expected schema');
  }

  // 2. Test POST /api/reality-check (Groq / Grok)
  console.log('\n2. Testing POST /api/reality-check (Groq/Grok Contradictory Advisor)...');
  const realityRes = await fetch('http://localhost:3000/api/reality-check', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      strategy: 'Cut all exploratory R&D and double headcount in outbound sales reps to hit $5M ARR in 6 months.',
    }),
  });

  console.log(`Reality Check HTTP Status: ${realityRes.status}`);
  const realityJson = await realityRes.json();
  console.log('Reality Check Result:\n', JSON.stringify(realityJson, null, 2));

  if (!realityJson.success || !realityJson.data) {
    throw new Error(`Reality Check call failed: ${realityJson.error || 'Unknown error'}`);
  }

  const realityData = realityJson.data;
  if (
    typeof realityData.strategyEvaluated === 'string' &&
    Array.isArray(realityData.counterarguments) &&
    Array.isArray(realityData.blindSpots) &&
    typeof realityData.verdict === 'string' &&
    typeof realityData.simulated === 'boolean'
  ) {
    console.log('✓ Grok/Groq Contradictory Advisor route passed verification!');
  } else {
    throw new Error('Reality Check response does not match expected schema');
  }

  console.log('\n>>> ALL DUAL-AI ROUTES OPERATIONAL AND FULLY VERIFIED! <<<');
}

testDualAI().catch((err) => {
  console.error('Dual AI test failed:', err);
  process.exit(1);
});
