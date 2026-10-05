import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const DEV_AUTH_HEADER = {
  'Content-Type': 'application/json',
  'x-session-token': 'dev-founder-session',
};

async function testPdfPersistence() {
  console.log('Testing PDF Ingestion Persistence with Gemini 1.5 Flash...');
  const fakePdfBase64 = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Title (FounderSync Monthly Telemetry) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
  ).toString('base64');

  const res = await fetch(`${BASE_URL}/api/ingest-metrics`, {
    method: 'POST',
    headers: DEV_AUTH_HEADER,
    body: JSON.stringify({
      pdfBase64: fakePdfBase64,
    }),
  });

  console.log('PDF Ingest Status:', res.status);
  const json = await res.json();
  console.log('PDF Ingest Success:', json.success);
  console.log('PDF Ingest Model:', json.model);
  console.log('PDF Ingest Persisted:', json.persisted);
  console.log('PDF Ingest Record ID:', json.recordId);
  console.log('PDF Ingest Table:', json.savedTable);
  console.log('Calculated Metrics:', {
    arr: json.calculatedMetrics?.arr,
    burnRate: json.calculatedMetrics?.burnRate,
    burnoutIndex: json.calculatedMetrics?.burnoutIndex,
  });

  if (json.persisted && json.recordId) {
    console.log('✓ SUCCESS: PDF ingestion with Gemini 1.5 Flash persisted to Supabase database!');
  } else {
    console.error('FAILED to persist PDF metrics:', json.persistenceError);
    process.exit(1);
  }
}

testPdfPersistence().catch(console.error);
