/**
 * FounderSync Ingestion Contract — Pure Extraction & Calculation Engine
 * Implements strict Phase 1 (Extraction) & Phase 2 (Calculation) logic
 * completely resilient against prompt injection attacks.
 */

export interface ExtractedMetrics {
  company_name: string | null;
  reporting_month: string | null;
  mrr: number | null;
  total_active_customers: number | null;
  monthly_revenue: number | null;
  customers_lost: number | null;
  starting_customers: number | null;
  avg_revenue_per_customer: number | null;
  monthly_expenses: number | null;
  cash_in_bank: number | null;
  burnout_answers: number[] | null;
  trust_answers: number[] | null;
  cognitive_load_answers: number[] | null;
  retention_answers: number[] | null;
}

export interface CalculatedMetrics {
  arr?: number;
  monthly_churn_rate?: number;
  clv?: number;
  burn_rate?: number;
  runway_months?: number | null;
  burnout_score?: number;
  trust_score?: number;
  cognitive_load_score?: number;
  retention_score?: number;
  human_centric_subscore?: number;
  burnout_score_band?: 'low' | 'moderate' | 'high';
}

export interface IngestionResponse {
  status: 'ok' | 'incomplete';
  missing_fields: string[];
  extracted: ExtractedMetrics;
  calculated: CalculatedMetrics | Record<string, never>;
}

/**
 * Standard 2-decimal place precision helper (no rounding beyond 2 decimals).
 */
export function roundToTwo(value: number): number {
  if (!isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Safe numeric parser for currency, percentages, commas, and N/A detection.
 */
function parseNumericField(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const str = raw.trim().replace(/^[*_~"`']+|[*_~"`']+$/g, '').trim();
  if (!str || /^(n\/?a|none|null|nil|-|undefined)$/i.test(str)) {
    return null;
  }

  // Handle shorthand e.g. $120k or $1.2M
  const kMatch = str.match(/^[$€£]?\s*([0-9.]+)\s*k$/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1]) * 1000;
    return isNaN(val) ? null : roundToTwo(val);
  }
  const mMatch = str.match(/^[$€£]?\s*([0-9.]+)\s*m$/i);
  if (mMatch) {
    const val = parseFloat(mMatch[1]) * 1000000;
    return isNaN(val) ? null : roundToTwo(val);
  }

  // Remove symbols, commas, percent, whitespace
  const cleaned = str.replace(/[$€£,%]/g, '').trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : roundToTwo(val);
}

/**
 * Safe string extractor for text fields.
 */
function parseStringField(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const str = raw.trim().replace(/^[*_~"`']+|[*_~"`']+$/g, '').trim();
  if (!str || /^(n\/?a|none|null|nil|-|undefined)$/i.test(str)) {
    return null;
  }
  return str;
}

/**
 * Extracts key-value matches using case-insensitive regex patterns across line boundaries.
 */
function extractFieldValue(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = match[1].trim();
      // Skip if value is a section header remnant e.g. "& Period" or "Inputs"
      if (val.length > 0 && !/^(&\s*period|inputs|survey)/i.test(val)) {
        return val;
      }
    }
  }
  return null;
}

/**
 * Extracts exactly 10 integer answers (1–10) for a survey category.
 * If fewer or more than 10 are found, or if any score is out of range, returns null.
 */
function extractSurveyAnswers(text: string, categoryKeys: string[]): number[] | null {
  // Strategy 1: Check for explicit array or list line (e.g. burnout_answers: [4, 5, ...])
  for (const key of categoryKeys) {
    const inlineRegex = new RegExp(`(?:${key})[\\s:=]+(?:\\[([^\\]]+)\\]|([0-9,\\s]+))`, 'i');
    const inlineMatch = text.match(inlineRegex);
    if (inlineMatch) {
      const content = inlineMatch[1] || inlineMatch[2];
      if (content) {
        const numbers = content
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((n) => parseInt(n, 10));

        if (numbers.length === 10 && numbers.every((n) => !isNaN(n) && n >= 1 && n <= 10)) {
          return numbers;
        }
      }
    }
  }

  // Strategy 2: Find section slice for this survey category
  // Looks for section header until the next survey section or major section
  for (const key of categoryKeys) {
    const sectionHeaderRegex = new RegExp(
      `(?:^|\\n)[\\s#*_-]*(?:${key})[^\\n]*\\n([\\s\\S]*?)(?=(?:\\n[\\s#*_-]*(?:Burnout|Trust|Cognitive|Retention|Company|Revenue|Churn|Customer Value|Burn & Runway)[^\\n]*\\n)|$)`,
      'i'
    );
    const sectionMatch = text.match(sectionHeaderRegex);
    if (sectionMatch && sectionMatch[1]) {
      const sectionText = sectionMatch[1];
      const answers: number[] = [];

      // Process line by line
      const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean);

      for (const line of lines) {
        // Match line like: "1. 7", "Q1: 7", "Question 1: 7/10", "1) 7", "7/10", "Score: 7", or single integer "7"
        const questionMatch = line.match(/(?:^|q(?:uestion)?\s*\d+|\d+)[\s.:)-]+\s*(\d{1,2})(?:\s*\/\s*10)?/i);
        if (questionMatch) {
          const num = parseInt(questionMatch[1], 10);
          if (num >= 1 && num <= 10) {
            answers.push(num);
            continue;
          }
        }

        // Match standalone integer (1-10) or score format
        const standaloneMatch = line.match(/^(\d{1,2})(?:\s*\/\s*10)?$/);
        if (standaloneMatch) {
          const num = parseInt(standaloneMatch[1], 10);
          if (num >= 1 && num <= 10) {
            answers.push(num);
          }
        }
      }

      if (answers.length === 10 && answers.every((n) => n >= 1 && n <= 10)) {
        return answers;
      }
    }
  }

  return null;
}

/**
 * Main Ingestion Contract Function
 */
export function ingestMetricsDocument(documentText: string): IngestionResponse {
  const missing_fields: string[] = [];

  if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
    const allFields: (keyof ExtractedMetrics)[] = [
      'company_name',
      'reporting_month',
      'mrr',
      'total_active_customers',
      'monthly_revenue',
      'customers_lost',
      'starting_customers',
      'avg_revenue_per_customer',
      'monthly_expenses',
      'cash_in_bank',
      'burnout_answers',
      'trust_answers',
      'cognitive_load_answers',
      'retention_answers',
    ];
    return {
      status: 'incomplete',
      missing_fields: allFields,
      extracted: {
        company_name: null,
        reporting_month: null,
        mrr: null,
        total_active_customers: null,
        monthly_revenue: null,
        customers_lost: null,
        starting_customers: null,
        avg_revenue_per_customer: null,
        monthly_expenses: null,
        cash_in_bank: null,
        burnout_answers: null,
        trust_answers: null,
        cognitive_load_answers: null,
        retention_answers: null,
      },
      calculated: {},
    };
  }

  // ==========================================
  // PHASE 1 — EXTRACTION (no math yet)
  // ==========================================

  // 1. Company Name
  const rawCompanyName = extractFieldValue(documentText, [
    /(?:company[_\s-]*name|startup[_\s-]*name)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
    /(?:^|\n)\s*[*_~]*(?:company|organization)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const company_name = parseStringField(rawCompanyName);
  if (!company_name) missing_fields.push('company_name');

  // 2. Reporting Month
  const rawReportingMonth = extractFieldValue(documentText, [
    /(?:reporting[_\s-]*month|report[_\s-]*month|reporting[_\s-]*period)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
    /(?:^|\n)\s*[*_~]*(?:period|month)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const reporting_month = parseStringField(rawReportingMonth);
  if (!reporting_month) missing_fields.push('reporting_month');

  // 3. MRR
  const rawMrr = extractFieldValue(documentText, [
    /(?:^|\n)[^\n:]*?\bmrr\b[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
    /(?:monthly[_\s-]*recurring[_\s-]*revenue)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const mrr = parseNumericField(rawMrr);
  if (mrr === null) missing_fields.push('mrr');

  // 4. Total Active Customers
  const rawTotalActiveCustomers = extractFieldValue(documentText, [
    /(?:total[_\s-]*active[_\s-]*customers|active[_\s-]*customers|current[_\s-]*active[_\s-]*customers)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
    /(?:total[_\s-]*customers)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const total_active_customers = parseNumericField(rawTotalActiveCustomers);
  if (total_active_customers === null) missing_fields.push('total_active_customers');

  // 5. Monthly Revenue
  const rawMonthlyRevenue = extractFieldValue(documentText, [
    /(?:monthly[_\s-]*revenue|total[_\s-]*monthly[_\s-]*revenue|recognized[_\s-]*monthly[_\s-]*revenue)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
    /(?:^|\n)\s*[*_~]*revenue[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const monthly_revenue = parseNumericField(rawMonthlyRevenue);
  if (monthly_revenue === null) missing_fields.push('monthly_revenue');

  // 6. Customers Lost
  const rawCustomersLost = extractFieldValue(documentText, [
    /(?:customers[_\s-]*lost|lost[_\s-]*customers|churned[_\s-]*customers|customer[_\s-]*churn[_\s-]*count)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const customers_lost = parseNumericField(rawCustomersLost);
  if (customers_lost === null) missing_fields.push('customers_lost');

  // 7. Starting Customers
  const rawStartingCustomers = extractFieldValue(documentText, [
    /(?:starting[_\s-]*customers|beginning[_\s-]*customers|initial[_\s-]*customers|start[_\s-]*customers)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const starting_customers = parseNumericField(rawStartingCustomers);
  if (starting_customers === null) missing_fields.push('starting_customers');

  // 8. Average Revenue Per Customer (Nullable — see Phase 2)
  const rawAvgRevenuePerCustomer = extractFieldValue(documentText, [
    /(?:avg(?:erage)?[_\s-]*revenue[_\s-]*per[_\s-]*customer|average[_\s-]*revenue[_\s-]*per[_\s-]*user|arpu|arpa)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const avg_revenue_per_customer = parseNumericField(rawAvgRevenuePerCustomer);
  if (avg_revenue_per_customer === null) {
    missing_fields.push('avg_revenue_per_customer');
  }

  // 9. Monthly Expenses
  const rawMonthlyExpenses = extractFieldValue(documentText, [
    /(?:monthly[_\s-]*expenses|total[_\s-]*monthly[_\s-]*expenses|operating[_\s-]*expenses)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
    /(?:^|\n)\s*[*_~]*expenses[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const monthly_expenses = parseNumericField(rawMonthlyExpenses);
  if (monthly_expenses === null) missing_fields.push('monthly_expenses');

  // 10. Cash In Bank
  const rawCashInBank = extractFieldValue(documentText, [
    /(?:cash[_\s-]*in[_\s-]*bank|cash[_\s-]*balance|bank[_\s-]*balance|total[_\s-]*cash)[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
    /(?:^|\n)\s*[*_~]*cash[*_~]*\s*[:=]\s*([^\r\n;]+)/i,
  ]);
  const cash_in_bank = parseNumericField(rawCashInBank);
  if (cash_in_bank === null) missing_fields.push('cash_in_bank');

  // 11. Burnout Answers (10 integers 1–10)
  const burnout_answers = extractSurveyAnswers(documentText, [
    'burnout_answers',
    'burnout_scores',
    'burnout survey',
    'team burnout survey',
    'burnout assessment',
    'burnout',
  ]);
  if (!burnout_answers) missing_fields.push('burnout_answers');

  // 12. Trust Answers (10 integers 1–10)
  const trust_answers = extractSurveyAnswers(documentText, [
    'trust_answers',
    'trust_scores',
    'trust survey',
    'customer trust survey',
    'trust assessment',
    'trust',
  ]);
  if (!trust_answers) missing_fields.push('trust_answers');

  // 13. Cognitive Load Answers (10 integers 1–10)
  const cognitive_load_answers = extractSurveyAnswers(documentText, [
    'cognitive_load_answers',
    'cognitive_load_scores',
    'cognitive load survey',
    'founder cognitive load survey',
    'cognitive load',
  ]);
  if (!cognitive_load_answers) missing_fields.push('cognitive_load_answers');

  // 14. Retention Answers (10 integers 1–10)
  const retention_answers = extractSurveyAnswers(documentText, [
    'retention_answers',
    'retention_scores',
    'retention survey',
    'retention sentiment survey',
    'retention sentiment',
    'retention',
  ]);
  if (!retention_answers) missing_fields.push('retention_answers');

  const extracted: ExtractedMetrics = {
    company_name,
    reporting_month,
    mrr,
    total_active_customers,
    monthly_revenue,
    customers_lost,
    starting_customers,
    avg_revenue_per_customer,
    monthly_expenses,
    cash_in_bank,
    burnout_answers,
    trust_answers,
    cognitive_load_answers,
    retention_answers,
  };

  // Check required fields (all except avg_revenue_per_customer)
  const requiredMissingFields = missing_fields.filter(
    (field) => field !== 'avg_revenue_per_customer'
  );

  if (requiredMissingFields.length > 0) {
    return {
      status: 'incomplete',
      missing_fields,
      extracted,
      calculated: {},
    };
  }

  // ==========================================
  // PHASE 2 — CALCULATION
  // ==========================================

  // arr = mrr * 12
  const arr = roundToTwo((mrr as number) * 12);

  // monthly_churn_rate = (customers_lost / starting_customers) * 100
  const startingCust = starting_customers as number;
  const monthly_churn_rate =
    startingCust > 0
      ? roundToTwo(((customers_lost as number) / startingCust) * 100)
      : 0;

  // if avg_revenue_per_customer is null: avg_revenue_per_customer = mrr / total_active_customers
  const activeCust = total_active_customers as number;
  const effectiveArpu =
    avg_revenue_per_customer !== null
      ? avg_revenue_per_customer
      : activeCust > 0
      ? roundToTwo((mrr as number) / activeCust)
      : 0;

  // clv = avg_revenue_per_customer / (monthly_churn_rate / 100)
  const clv =
    monthly_churn_rate > 0
      ? roundToTwo(effectiveArpu / (monthly_churn_rate / 100))
      : 0;

  // burn_rate = monthly_expenses - monthly_revenue
  const burn_rate = roundToTwo((monthly_expenses as number) - (monthly_revenue as number));

  // runway_months = cash_in_bank / burn_rate (null if burn_rate <= 0)
  const runway_months =
    burn_rate > 0 ? roundToTwo((cash_in_bank as number) / burn_rate) : null;

  // Survey Scores
  const burnout_score = (burnout_answers as number[]).reduce((sum, val) => sum + val, 0);
  const trust_score = (trust_answers as number[]).reduce((sum, val) => sum + val, 0);
  const cognitive_load_score = (cognitive_load_answers as number[]).reduce((sum, val) => sum + val, 0);
  const retention_score = (retention_answers as number[]).reduce((sum, val) => sum + val, 0);

  // human_centric_subscore = (burnout_score + trust_score + cognitive_load_score + retention_score) / 4
  const human_centric_subscore = roundToTwo(
    (burnout_score + trust_score + cognitive_load_score + retention_score) / 4
  );

  // Score bands (attach as labels, do not alter the numeric score):
  // burnout_score: 0–33 low, 34–66 moderate, 67–100 high
  let burnout_score_band: 'low' | 'moderate' | 'high' = 'low';
  if (burnout_score >= 67) {
    burnout_score_band = 'high';
  } else if (burnout_score >= 34) {
    burnout_score_band = 'moderate';
  } else {
    burnout_score_band = 'low';
  }

  return {
    status: 'ok',
    missing_fields,
    extracted,
    calculated: {
      arr,
      monthly_churn_rate,
      clv,
      burn_rate,
      runway_months,
      burnout_score,
      trust_score,
      cognitive_load_score,
      retention_score,
      human_centric_subscore,
      burnout_score_band,
    },
  };
}
