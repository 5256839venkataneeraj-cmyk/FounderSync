// Verify HTML output of localhost:3000
async function test() {
  try {
    const res = await fetch('http://localhost:3000/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    console.log('Status: 200 OK');
    console.log('HTML size:', text.length, 'bytes');
    console.log('Has Brand "FounderSync":', text.includes('FounderSync'));
    console.log('Has "Contradictory Workspace":', text.includes('Contradictory Workspace'));
    console.log('Has "Dashboard" tab:', text.includes('Dashboard'));
    console.log('Has "Advisor" tab:', text.includes('Advisor'));
    console.log('Has "Reports" tab:', text.includes('Reports'));
    console.log('Has "Team & Customer Insights" tab:', text.includes('Team &amp; Customer Insights') || text.includes('Team & Customer Insights'));
    console.log('Has "Settings" tab:', text.includes('Settings'));
    console.log('Has "Good morning, Alex":', text.includes('Good morning, Alex'));
    console.log('Has Today Reality Check:', text.includes('Today’s Reality Check') || text.includes('Today&#x27;s Reality Check'));
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

test();
