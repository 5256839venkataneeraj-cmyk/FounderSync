async function testPdfUpload() {
  console.log('Testing PDF Base64 ingestion endpoint...');
  // Sample base64 PDF
  const fakePdfBase64 = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (FounderSync Monthly Report) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF').toString('base64');

  const res = await fetch('http://localhost:3000/api/ingest-metrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-session': 'founder-workspace-session',
    },
    body: JSON.stringify({
      pdfBase64: fakePdfBase64,
      fileName: 'test-metrics.pdf',
    }),
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response keys:', Object.keys(data));
  console.log('calculatedMetrics:', data.calculatedMetrics);
  if (data.calculatedMetrics && data.calculatedMetrics.arr) {
    console.log('✓ Success! calculatedMetrics received with ARR:', data.calculatedMetrics.arr);
  } else {
    console.error('Failed to get calculatedMetrics:', data);
  }
}

testPdfUpload().catch(console.error);
