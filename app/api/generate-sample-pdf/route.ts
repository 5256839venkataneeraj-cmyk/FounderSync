import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const runtime = 'nodejs';

/**
 * Builds and streams a complete, pre-filled FounderSync Sample Intake PDF
 * using pdf-lib with realistic mock telemetry and 40 qualitative survey ratings.
 */
export async function GET(req: NextRequest) {
  try {
    const pdfDoc = await PDFDocument.create();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

    const primaryColor = rgb(0.12, 0.16, 0.54); // Deep Indigo
    const textColor = rgb(0.15, 0.18, 0.25);
    const lightGray = rgb(0.55, 0.58, 0.65);
    const accentBg = rgb(0.95, 0.96, 0.99);
    const borderLine = rgb(0.85, 0.88, 0.93);

    // ==========================================
    // PAGE 1: Financial Telemetry & Burnout Survey
    // ==========================================
    const page1 = pdfDoc.addPage([612, 792]);
    let y = 745;

    // Header Bar
    page1.drawRectangle({
      x: 36,
      y: y - 10,
      width: 540,
      height: 48,
      color: primaryColor,
    });

    page1.drawText('FOUNDERSYNC — MONTHLY METRICS INTAKE FORM', {
      x: 52,
      y: y + 16,
      size: 15,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page1.drawText('Standardized Portfolio Telemetry v2.0 | Automated AI Ingestion Specification', {
      x: 52,
      y: y + 1,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.85, 0.88, 0.98),
    });

    y -= 45;

    // Metadata Card
    page1.drawRectangle({
      x: 36,
      y: y - 44,
      width: 540,
      height: 44,
      color: accentBg,
      borderColor: borderLine,
      borderWidth: 1,
    });

    page1.drawText('Company Name:', { x: 50, y: y - 18, size: 9, font: fontBold, color: textColor });
    page1.drawText('Acme Technologies Inc.', { x: 135, y: y - 18, size: 9.5, font: fontRegular, color: primaryColor });

    page1.drawText('Reporting Period:', { x: 330, y: y - 18, size: 9, font: fontBold, color: textColor });
    page1.drawText('October 2026', { x: 425, y: y - 18, size: 9.5, font: fontRegular, color: primaryColor });

    page1.drawText('Template Schema:', { x: 50, y: y - 34, size: 8, font: fontRegular, color: lightGray });
    page1.drawText('Template v1.0 — 2026-09 (Full Dual-AI Verification)', { x: 135, y: y - 34, size: 8, font: fontMono, color: lightGray });

    y -= 70;

    // SECTION 1: FINANCIAL & GROWTH TELEMETRY
    page1.drawText('1. FINANCIAL & GROWTH INPUTS (QUANTITATIVE TELEMETRY)', {
      x: 36,
      y,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });

    y -= 6;
    page1.drawLine({
      start: { x: 36, y },
      end: { x: 576, y },
      thickness: 1,
      color: borderLine,
    });

    y -= 18;

    const financialInputs = [
      { label: 'Monthly Recurring Revenue (MRR):', value: '$120,833', note: 'Primary recurring subscription run-rate' },
      { label: 'Starting Customers (Beginning of Period):', value: '500', note: 'Active accounts on Day 1 of month' },
      { label: 'Customers Lost (Monthly Churned):', value: '19', note: 'Accounts cancelled or churned during month' },
      { label: 'Total Active Customers (End of Period):', value: '500', note: 'Total paying subscriptions at month close' },
      { label: 'Monthly Revenue (Gross Collected):', value: '$120,833', note: 'Gross collected top-line revenue' },
      { label: 'Monthly Expenses (Total Operating Costs):', value: '$150,000', note: 'Payroll, infrastructure, marketing, overhead' },
      { label: 'Cash in Bank (Total Liquid Reserves):', value: '$1,250,000', note: 'Total unencumbered cash balance' },
      { label: 'Average Revenue Per Customer (ARPU):', value: '$241.67', note: 'Effective ARPU = MRR / Total Active Customers' },
    ];

    financialInputs.forEach((item, idx) => {
      const rowY = y - idx * 20;
      if (idx % 2 === 0) {
        page1.drawRectangle({
          x: 36,
          y: rowY - 5,
          width: 540,
          height: 18,
          color: rgb(0.98, 0.98, 1),
        });
      }
      page1.drawText(item.label, { x: 44, y: rowY, size: 8.5, font: fontBold, color: textColor });
      page1.drawText(item.value, { x: 280, y: rowY, size: 9, font: fontMono, color: primaryColor });
      page1.drawText(item.note, { x: 360, y: rowY, size: 7.5, font: fontRegular, color: lightGray });
    });

    y -= financialInputs.length * 20 + 25;

    // SECTION 2: QUALITATIVE SURVEY — PART A: TEAM BURNOUT
    page1.drawText('2. QUALITATIVE SURVEY (40 QUESTIONS — RATED 1 TO 10)', {
      x: 36,
      y,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });

    y -= 6;
    page1.drawLine({
      start: { x: 36, y },
      end: { x: 576, y },
      thickness: 1,
      color: borderLine,
    });

    y -= 16;
    page1.drawText('Category A: Team Burnout Survey (Questions 1 to 10 | 1 = Minimal Fatigue, 10 = Severe Exhaustion)', {
      x: 36,
      y,
      size: 9,
      font: fontBold,
      color: textColor,
    });

    y -= 14;

    const burnoutQuestions = [
      { q: 'Q01. Engineering overtime hours and weekend Slack activity', score: '4' },
      { q: 'Q02. Frequency of missed deadlines or compressed sprint rest', score: '3' },
      { q: 'Q03. Team morale during weekly retrospectives and standups', score: '4' },
      { q: 'Q04. Sick leave, personal day requests, and unexplained absences', score: '4' },
      { q: 'Q05. Cross-functional friction between product and sales teams', score: '3' },
      { q: 'Q06. Leadership bandwidth dedicated to reactive fire-fighting', score: '4' },
      { q: 'Q07. Turnover risk or flight sentiment among core senior contributors', score: '3' },
      { q: 'Q08. Meeting density preventing deep focused engineering execution', score: '4' },
      { q: 'Q09. On-call alert fatigue and incident response disruption', score: '4' },
      { q: 'Q10. Perceived sustainability of current quarterly sprint roadmap', score: '4' },
    ];

    burnoutQuestions.forEach((item, idx) => {
      const rowY = y - idx * 16;
      page1.drawText(item.q, { x: 44, y: rowY, size: 8, font: fontRegular, color: textColor });
      page1.drawText(`Score: ${item.score}/10`, { x: 505, y: rowY, size: 8, font: fontBold, color: primaryColor });
    });

    // Page 1 Footer
    page1.drawText('FounderSync Intake v2.0 | Page 1 of 2 | Burnout Array: [4, 3, 4, 4, 3, 4, 3, 4, 4, 4]', {
      x: 36,
      y: 28,
      size: 8,
      font: fontMono,
      color: lightGray,
    });

    // ==========================================
    // PAGE 2: Surveys B, C, D & Expected Metrics
    // ==========================================
    const page2 = pdfDoc.addPage([612, 792]);
    let y2 = 745;

    // Page 2 Header
    page2.drawText('QUALITATIVE SURVEY CONTINUED (CATEGORIES B, C, D)', {
      x: 36,
      y: y2,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });

    y2 -= 6;
    page2.drawLine({
      start: { x: 36, y: y2 },
      end: { x: 576, y: y2 },
      thickness: 1,
      color: borderLine,
    });

    y2 -= 16;

    // Category B: Customer Trust Survey
    page2.drawText('Category B: Customer Trust Survey (Questions 11 to 20 | 1 = Low Trust, 10 = Absolute Trust)', {
      x: 36,
      y: y2,
      size: 9,
      font: fontBold,
      color: textColor,
    });
    y2 -= 14;

    const trustQuestions = [
      { q: 'Q11. Customer feedback sentiment on recent product releases and patches', score: '8' },
      { q: 'Q12. Executive willingness to recommend product to industry peers (NPS)', score: '9' },
      { q: 'Q13. Transparency and responsiveness during service incidents or bugs', score: '8' },
      { q: 'Q14. Alignment of product development roadmap with enterprise customer needs', score: '9' },
      { q: 'Q15. Renewal contract commitment strength and multi-year contract uptake', score: '8' },
      { q: 'Q16. Account managers ability to resolve high-friction escalations', score: '9' },
      { q: 'Q17. Customer security & privacy audit confidence score', score: '9' },
      { q: 'Q18. Customer willingness to participate in case studies and webinars', score: '8' },
      { q: 'Q19. Expansion revenue velocity from existing champion customer accounts', score: '9' },
      { q: 'Q20. Net promoter confidence rating during executive quarterly business reviews', score: '8' },
    ];

    trustQuestions.forEach((item, idx) => {
      const rowY = y2 - idx * 15;
      page2.drawText(item.q, { x: 44, y: rowY, size: 8, font: fontRegular, color: textColor });
      page2.drawText(`Score: ${item.score}/10`, { x: 505, y: rowY, size: 8, font: fontBold, color: primaryColor });
    });

    y2 -= trustQuestions.length * 15 + 20;

    // Category C: Founder Cognitive Load Survey
    page2.drawText('Category C: Founder Cognitive Load Survey (Questions 21 to 30 | 1 = Low Load, 10 = Severe Overload)', {
      x: 36,
      y: y2,
      size: 9,
      font: fontBold,
      color: textColor,
    });
    y2 -= 14;

    const cognitiveQuestions = [
      { q: 'Q21. Number of concurrent strategic decisions requiring direct founder sign-off', score: '6' },
      { q: 'Q22. Context-switching frequency across sales, engineering, hiring, and finance', score: '5' },
      { q: 'Q23. Mental fatigue experienced at end-of-day operational review', score: '6' },
      { q: 'Q24. Delegation efficacy: ability of middle leadership to execute autonomously', score: '7' },
      { q: 'Q25. Clarity on priority 1 vs priority 2 tasks during weekly executive sync', score: '6' },
      { q: 'Q26. Disruption from unplanned executive interruptions or urgent escalations', score: '5' },
      { q: 'Q27. Quality of founder sleep, restorative recovery, and evening downtime', score: '6' },
      { q: 'Q28. Emotional detachment when evaluating critical product or strategy dilemmas', score: '7' },
      { q: 'Q29. Bandwidth available for strategic long-range market thesis planning', score: '6' },
      { q: 'Q30. Subjective sense of control over monthly burn and organizational momentum', score: '5' },
    ];

    cognitiveQuestions.forEach((item, idx) => {
      const rowY = y2 - idx * 15;
      page2.drawText(item.q, { x: 44, y: rowY, size: 8, font: fontRegular, color: textColor });
      page2.drawText(`Score: ${item.score}/10`, { x: 505, y: rowY, size: 8, font: fontBold, color: primaryColor });
    });

    y2 -= cognitiveQuestions.length * 15 + 20;

    // Category D: Retention Sentiment Survey
    page2.drawText('Category D: Retention Sentiment Survey (Questions 31 to 40 | 1 = High Churn Risk, 10 = Ironclad Retention)', {
      x: 36,
      y: y2,
      size: 9,
      font: fontBold,
      color: textColor,
    });
    y2 -= 14;

    const retentionQuestions = [
      { q: 'Q31. Daily and weekly active usage frequency among core seat holders', score: '8' },
      { q: 'Q32. Customer reliance on workflow integrations with third-party systems', score: '8' },
      { q: 'Q33. Health telemetry: reduction in low-usage or dormant seat licenses', score: '9' },
      { q: 'Q34. Customer response speed during annual renewal and expansion reviews', score: '8' },
      { q: 'Q35. Competitor displacement attempts successfully resisted or rebuffed', score: '8' },
      { q: 'Q36. Depth of product feature adoption across non-core user departments', score: '9' },
      { q: 'Q37. Customer team enthusiasm when onboarding newly released product modules', score: '8' },
      { q: 'Q38. Direct executive relationships established with customer sponsor C-suite', score: '8' },
      { q: 'Q39. Low volume of pricing or contract discount concessions demanded at renewal', score: '9' },
      { q: 'Q40. High likelihood of multi-year contract renewals based on product value delivered', score: '8' },
    ];

    retentionQuestions.forEach((item, idx) => {
      const rowY = y2 - idx * 15;
      page2.drawText(item.q, { x: 44, y: rowY, size: 8, font: fontRegular, color: textColor });
      page2.drawText(`Score: ${item.score}/10`, { x: 505, y: rowY, size: 8, font: fontBold, color: primaryColor });
    });

    y2 -= retentionQuestions.length * 15 + 20;

    // SUMMARY CALCULATION VERIFICATION BOX
    page2.drawRectangle({
      x: 36,
      y: y2 - 40,
      width: 540,
      height: 42,
      color: accentBg,
      borderColor: primaryColor,
      borderWidth: 1,
    });

    page2.drawText('OFFICIAL CALCULATION BASELINE FOR GEMINI 1.5 FLASH:', {
      x: 46,
      y: y2 - 14,
      size: 8,
      font: fontBold,
      color: primaryColor,
    });

    const baselineFormulaStr =
      'ARR: $1,449,996 | Churn Rate: 3.8% (19/500) | ARPU: $241.67 | CLV: $6,359.74 | Net Burn: $29,167 | Runway: 42.86 mo\nBurnout: 37/100 | Trust: 85/100 | Cognitive Load: 59/100 | Retention: 82/100 | Human Subscore: 65.75/100';

    page2.drawText(baselineFormulaStr, {
      x: 46,
      y: y2 - 27,
      size: 7.2,
      font: fontMono,
      color: textColor,
    });

    // Page 2 Footer
    page2.drawText('FounderSync Intake v2.0 | Page 2 of 2 | Ready for Automated Base64 Gemini Extraction', {
      x: 36,
      y: 28,
      size: 8,
      font: fontMono,
      color: lightGray,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="FounderSync_Sample_Intake.pdf"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[GenerateSamplePdf] Error generating sample PDF:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate sample PDF' },
      { status: 500 }
    );
  }
}
