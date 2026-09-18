async function testPage() {
  console.log('Fetching http://localhost:3000 ...');
  const res = await fetch('http://localhost:3000');
  console.log(`HTTP Status: ${res.status}`);
  const html = await res.text();
  console.log(`HTML Length: ${html.length}`);
  if (res.status === 200 && html.includes('FounderSync')) {
    console.log('>>> SUCCESS: Page rendered cleanly with HTTP 200! <<<');
  } else {
    console.error('Page render error or 500 status! HTML snippet:\n', html.slice(0, 500));
    process.exit(1);
  }
}

testPage().catch(err => {
  console.error('Fetch failed:', err);
  process.exit(1);
});
