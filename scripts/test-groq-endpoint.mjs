// Test live Groq Reality-Check through the API endpoint
async function test() {
  console.log('Testing live Groq API key via POST /api/reality-check...');

  const strategy = "We plan to cut customer support headcount by 50% and replace them with an AI chatbot to improve gross margins before our next fundraise.";

  const response = await fetch('http://localhost:3000/api/reality-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-session-token',
    },
    body: JSON.stringify({ strategy }),
  });

  console.log('Status:', response.status);
  const json = await response.json();

  console.log('\n--- RESPONSE BODY ---');
  console.log('Success:', json.success);
  if (json.data) {
    console.log('Model:', json.data.model);
    console.log('Simulated:', json.data.simulated);
    console.log('Verdict:', json.data.verdict);
    console.log('Counterarguments:', json.data.counterarguments);
    console.log('Blind spots:', json.data.blindSpots);
  } else {
    console.log('Error:', json.error);
  }

  if (json.data && json.data.simulated === false) {
    console.log('\n>>> SUCCESS: Groq API Key is working LIVE! Real model response received! <<<');
  } else {
    console.log('\nReturned simulation or error.');
  }
}

test().catch(console.error);
