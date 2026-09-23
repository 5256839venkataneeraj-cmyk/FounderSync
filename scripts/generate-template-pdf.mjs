import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateTemplatePDF() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const form = pdfDoc.getForm();

  // Dimensions: Standard Letter 612 x 792 pt
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const brandDark = rgb(0.09, 0.12, 0.22); // #171E38
  const brandPrimary = rgb(0.18, 0.22, 0.88); // #2E37E0
  const brandSlate = rgb(0.4, 0.45, 0.55);
  const textDark = rgb(0.12, 0.14, 0.18);
  const borderLight = rgb(0.82, 0.85, 0.9);
  const fieldBg = rgb(0.97, 0.98, 1.0);

  // Helper for adding footer to every page
  const addFooter = (page, pageNum, totalPages) => {
    page.drawLine({
      start: { x: margin, y: 35 },
      end: { x: pageWidth - margin, y: 35 },
      thickness: 0.75,
      color: borderLight,
    });
    page.drawText('FounderSync Monthly Metrics Intake Form', {
      x: margin,
      y: 22,
      size: 8,
      font: fontRegular,
      color: brandSlate,
    });
    page.drawText('Template v1.0 — 2026-09', {
      x: margin + 200,
      y: 22,
      size: 8,
      font: fontBold,
      color: brandPrimary,
    });
    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: pageWidth - margin - 50,
      y: 22,
      size: 8,
      font: fontRegular,
      color: brandSlate,
    });
  };

  // ==========================================
  // PAGE 1: Quantitative Metrics
  // ==========================================
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title Banner
  page1.drawRectangle({
    x: margin,
    y: y - 56,
    width: contentWidth,
    height: 56,
    color: rgb(0.96, 0.97, 1.0),
    borderColor: brandPrimary,
    borderWidth: 1,
  });

  page1.drawText('FounderSync Monthly Metrics Intake Form', {
    x: margin + 14,
    y: y - 24,
    size: 16,
    font: fontBold,
    color: brandDark,
  });

  page1.drawText('Standardized Monthly Ingestion Document · Direct Intake Protocol', {
    x: margin + 14,
    y: y - 42,
    size: 9,
    font: fontRegular,
    color: brandSlate,
  });

  y -= 74;

  const drawSectionHeader = (page, title, subtitle) => {
    page.drawRectangle({
      x: margin,
      y: y - 18,
      width: contentWidth,
      height: 20,
      color: rgb(0.93, 0.94, 0.97),
    });
    page.drawText(title, {
      x: margin + 8,
      y: y - 13,
      size: 11,
      font: fontBold,
      color: brandDark,
    });
    if (subtitle) {
      page.drawText(subtitle, {
        x: margin + 180,
        y: y - 13,
        size: 8,
        font: fontOblique,
        color: brandSlate,
      });
    }
    y -= 26;
  };

  const drawFieldRow = (page, label, fieldName, defaultValue = '', width = 200) => {
    page.drawText(label, {
      x: margin + 8,
      y: y - 10,
      size: 9,
      font: fontBold,
      color: textDark,
    });

    const textField = form.createTextField(fieldName);
    textField.setText(defaultValue);
    textField.addToPage(page, {
      x: margin + 200,
      y: y - 16,
      width: width,
      height: 18,
      textColor: textDark,
      backgroundColor: fieldBg,
      borderColor: borderLight,
      borderWidth: 1,
    });

    y -= 25;
  };

  // 1. Company & Period
  drawSectionHeader(page1, 'Company & Period', 'Required metadata');
  drawFieldRow(page1, 'Company Name:', 'company_name', '', 280);
  drawFieldRow(page1, 'Reporting Month:', 'reporting_month', '', 280);
  y -= 8;

  // 2. Revenue Inputs
  drawSectionHeader(page1, 'Revenue Inputs', 'Monetary & customer counts');
  drawFieldRow(page1, 'MRR:', 'mrr', '$');
  drawFieldRow(page1, 'Total Active Customers:', 'total_active_customers', '');
  drawFieldRow(page1, 'Monthly Revenue:', 'monthly_revenue', '$');
  y -= 8;

  // 3. Churn Inputs
  drawSectionHeader(page1, 'Churn Inputs', 'Customer retention cohorts');
  drawFieldRow(page1, 'Customers Lost:', 'customers_lost', '');
  drawFieldRow(page1, 'Starting Customers:', 'starting_customers', '');
  y -= 8;

  // 4. Customer Value Inputs
  drawSectionHeader(page1, 'Customer Value Inputs', 'Optional - calculated if blank');
  drawFieldRow(page1, 'Avg Revenue Per Customer:', 'avg_revenue_per_customer', '$');
  y -= 8;

  // 5. Burn & Runway Inputs
  drawSectionHeader(page1, 'Burn & Runway Inputs', 'Capital & expense velocity');
  drawFieldRow(page1, 'Monthly Expenses:', 'monthly_expenses', '$');
  drawFieldRow(page1, 'Cash In Bank:', 'cash_in_bank', '$');
  y -= 8;

  // Note for Page 1
  page1.drawText('* Note: Fill values accurately. Currency symbols ($) and commas are automatically parsed.', {
    x: margin + 8,
    y: y - 5,
    size: 7.5,
    font: fontOblique,
    color: brandSlate,
  });

  // ==========================================
  // PAGE 2: Qualitative Surveys (Burnout & Trust)
  // ==========================================
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);
  y = pageHeight - margin;

  const drawSurveyBlock = (page, surveyTitle, description, prefix) => {
    drawSectionHeader(page, surveyTitle, description);
    
    // Instructions
    page.drawText('Score each question from 1 to 10 (10 = highest intensity / strongest rating):', {
      x: margin + 8,
      y: y - 8,
      size: 8,
      font: fontOblique,
      color: brandSlate,
    });
    y -= 16;

    // 2 columns for 10 questions (5 per column)
    const questionsStartY = y;
    const colWidth = (contentWidth - 20) / 2;

    for (let i = 1; i <= 10; i++) {
      const col = i <= 5 ? 0 : 1;
      const row = (i - 1) % 5;
      const currentY = questionsStartY - row * 24;
      const currentX = margin + col * (colWidth + 20);

      page.drawText(`Q${i}:`, {
        x: currentX + 6,
        y: currentY - 10,
        size: 9,
        font: fontBold,
        color: textDark,
      });

      const qField = form.createTextField(`${prefix}_q${i}`);
      qField.setText('');
      qField.addToPage(page, {
        x: currentX + 38,
        y: currentY - 14,
        width: 36,
        height: 16,
        textColor: textDark,
        backgroundColor: fieldBg,
        borderColor: borderLight,
        borderWidth: 1,
      });

      page.drawText('/ 10', {
        x: currentX + 80,
        y: currentY - 10,
        size: 8,
        font: fontRegular,
        color: brandSlate,
      });
    }

    y = questionsStartY - 5 * 24 - 14;
  };

  drawSurveyBlock(
    page2,
    'Burnout Survey',
    'Team & founder fatigue indicators (1 = Low, 10 = Severe)',
    'burnout'
  );

  y -= 10;

  drawSurveyBlock(
    page2,
    'Trust Survey',
    'Customer & internal team psychological safety (1 = Low, 10 = High)',
    'trust'
  );

  y -= 10;

  drawSurveyBlock(
    page2,
    'Cognitive Load Survey',
    'Context-switching & operational noise (1 = Low, 10 = High)',
    'cognitive_load'
  );

  y -= 10;

  drawSurveyBlock(
    page2,
    'Retention Sentiment Survey',
    'Customer retention sentiment conviction (1 = Low, 10 = High)',
    'retention'
  );

  // Add Footers to all pages
  const totalPages = pdfDoc.getPageCount();
  for (let idx = 0; idx < totalPages; idx++) {
    addFooter(pdfDoc.getPage(idx), idx + 1, totalPages);
  }

  const pdfBytes = await pdfDoc.save();
  const outputDir = path.resolve('public/templates');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'FounderSync_Input_Template.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Successfully generated template PDF at: ${outputPath} (${pdfBytes.length} bytes)`);
}

generateTemplatePDF().catch((err) => {
  console.error('Error generating template PDF:', err);
  process.exit(1);
});
