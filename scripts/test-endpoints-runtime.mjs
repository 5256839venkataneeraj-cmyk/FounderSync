// Automated Runtime Test Suite for FounderSync API Endpoints
import { spawn } from 'child_process';

const PORT = 3055;
const BASE_URL = `http://localhost:${PORT}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log(`[Test Suite] Starting Next.js server on port ${PORT}...`);

  const server = spawn('cmd.exe', ['/c', `npx next start -p ${PORT}`], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => {
    // console.log(`[Next.js stdout] ${d.toString()}`);
  });
  server.stderr.on('data', (d) => {
    // console.error(`[Next.js stderr] ${d.toString()}`);
  });

  let ready = false;
  for (let i = 0; i < 40; i++) {
    await delay(500);
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      // still starting
    }
  }

  if (!ready) {
    console.error('Server failed to start within 20 seconds.');
    server.kill();
    process.exit(1);
  }

  console.log('[Test Suite] Server is ready. Running test cases...\n');
  let failures = 0;

  async function assertCase(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failures++;
    }
  }

  // TEST 1: Method 405 Enforcement on Strategic Analysis
  await assertCase('GET /api/strategic-analysis returns 405 Method Not Allowed', async () => {
    const res = await fetch(`${BASE_URL}/api/strategic-analysis`, { method: 'GET' });
    if (res.status !== 405) throw new Error(`Expected 405, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error('Expected success: false');
  });

  // TEST 2: Session 401 Enforcement on Strategic Analysis
  await assertCase('POST /api/strategic-analysis without auth returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/strategic-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error('Expected success: false');
  });

  // TEST 3: Authenticated Strategic Analysis Execution
  await assertCase('POST /api/strategic-analysis with auth returns 200 and conforms to StrategicAnalysisResult', async () => {
    const res = await fetch(`${BASE_URL}/api/strategic-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-session-token',
      },
      body: JSON.stringify({}),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.success !== true) throw new Error(`Expected success: true, got ${JSON.stringify(json)}`);
    const data = json.data;
    if (typeof data.summary !== 'string' || data.summary.length === 0) throw new Error('Missing or empty summary');
    if (!Array.isArray(data.strengths)) throw new Error('strengths must be an array');
    if (!Array.isArray(data.risks)) throw new Error('risks must be an array');
    if (!Array.isArray(data.recommendations)) throw new Error('recommendations must be an array');
    if (typeof data.confidence !== 'number') throw new Error('confidence must be a number');
    if (typeof data.model !== 'string') throw new Error('model must be a string');
    if (typeof data.simulated !== 'boolean') throw new Error('simulated must be a boolean');
    if (typeof data.generatedAt !== 'string') throw new Error('generatedAt must be an ISO timestamp');
  });

  // TEST 4: Method 405 Enforcement on Reality Check
  await assertCase('GET /api/reality-check returns 405 Method Not Allowed', async () => {
    const res = await fetch(`${BASE_URL}/api/reality-check`, { method: 'GET' });
    if (res.status !== 405) throw new Error(`Expected 405, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error('Expected success: false');
  });

  // TEST 5: Session 401 Enforcement on Reality Check
  await assertCase('POST /api/reality-check without auth returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/reality-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy: 'Increase pricing by 40% immediately' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error('Expected success: false');
  });

  // TEST 6: Zod 400 Validation on Short Strategy (< 10 chars)
  await assertCase('POST /api/reality-check with strategy < 10 chars returns 400 Bad Request with field errors', async () => {
    const res = await fetch(`${BASE_URL}/api/reality-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-session-token',
      },
      body: JSON.stringify({ strategy: 'Hire more' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error('Expected success: false');
    if (!json.details || !json.details.strategy) throw new Error('Expected details.strategy field error');
  });

  // TEST 7: Valid Reality Check Execution
  await assertCase('POST /api/reality-check with valid strategy returns 200 and conforms to RealityCheckResult', async () => {
    const strategy = 'Double engineering headcount immediately to pull forward Q4 roadmap';
    const res = await fetch(`${BASE_URL}/api/reality-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-session-token',
      },
      body: JSON.stringify({ strategy }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.success !== true) throw new Error(`Expected success: true, got ${JSON.stringify(json)}`);
    const data = json.data;
    if (data.strategyEvaluated !== strategy) throw new Error(`strategyEvaluated mismatch: ${data.strategyEvaluated}`);
    if (!Array.isArray(data.counterarguments) || data.counterarguments.length === 0) throw new Error('counterarguments must be non-empty array');
    if (!Array.isArray(data.blindSpots) || data.blindSpots.length === 0) throw new Error('blindSpots must be non-empty array');
    const validVerdicts = ['proceed', 'proceed_with_caution', 'reconsider'];
    if (!validVerdicts.includes(data.verdict)) throw new Error(`Invalid verdict: ${data.verdict}`);
    if (typeof data.model !== 'string') throw new Error('model must be string');
    if (typeof data.simulated !== 'boolean') throw new Error('simulated must be boolean');
    if (typeof data.generatedAt !== 'string') throw new Error('generatedAt must be string');
  });

  // Cleanup
  console.log('\n[Test Suite] Shutting down test server...');
  server.kill('SIGTERM');

  if (failures > 0) {
    console.error(`\nTest suite finished with ${failures} failure(s).`);
    process.exit(1);
  } else {
    console.log('\n[Test Suite] ALL 7 ENDPOINT & SECURITY TESTS PASSED PERFECTLY!');
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
