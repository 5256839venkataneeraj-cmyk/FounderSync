// Shared Contracts for FounderSync AI Integration Layer & API Endpoints

export const FIXED_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

export type FigmaTab = 'dashboard' | 'advisor' | 'reports' | 'insights' | 'settings';

// 1. Strategic Mirror & Analyst (Gemini) Contract
export interface StrategicAnalysisResult {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
  confidence: number; // 0-1
  model: string;
  simulated: boolean;
  generatedAt: string; // ISO timestamp
}

// 2. Reality-Check & Contradictory Advisor (Grok) Contract
export interface RealityCheckResult {
  strategyEvaluated: string;
  counterarguments: string[];
  blindSpots: string[];
  verdict: 'proceed' | 'proceed_with_caution' | 'reconsider';
  model: string;
  simulated: boolean;
  generatedAt: string;
}

// 3. Standard API Response Shapes
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  persisted?: boolean;
  realityCheckId?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: Record<string, string[] | string>;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 4. Metric Models
export interface GrowthMetrics {
  arr: number;
  churnRate: number;
  ltv: number;
  burnRate: number;
}

export interface HumanMetrics {
  burnoutIndex: number;
  customerTrustScore: number;
  founderCognitiveLoad: number;
  retentionSentiment: number;
}

export interface Metric {
  id?: string;
  workspace_id?: string;
  month: string;
  arr: number;
  churn_rate: number;
  ltv: number;
  burn_rate: number;
  team_burnout_index: number;
  customer_trust_score: number;
  founder_cognitive_load: number;
  retention_sentiment: number;
  created_at?: string;
}

export interface TimeSeriesPoint {
  month: string;
  revenueGrowth: number;
  teamWellnessIndex: number;
}

// 5. Decision & Heatmap Models
export type DecisionAction = 'ACCEPT_AND_OVERRIDE_AI' | 'PIVOT_STRATEGY';

export interface Decision {
  id: string;
  workspace_id?: string;
  reality_check_id?: string | null;
  action: DecisionAction;
  justification: string;
  created_at: string;
  reality_checks?: RealityCheckResult | null;
}

export type HeatmapQuadrant = 'marketFeasibility' | 'teamSustainability' | 'unitEconomics' | 'customerValue';

export interface HeatmapScore {
  id?: string;
  workspace_id?: string;
  marketFeasibility: number;
  teamSustainability: number;
  unitEconomics: number;
  customerValue: number;
  created_at?: string;
}

export interface ImbalanceResult {
  isImbalanced: boolean;
  neglectedQuadrant: HeatmapQuadrant | null;
  neglectedQuadrantLabel: string | null;
  delta: number;
  maxScore: number;
  minScore: number;
  maxQuadrant: HeatmapQuadrant;
  minQuadrant: HeatmapQuadrant;
}

export interface NormalizedScoreDetail {
  raw: number;
  normalized: number;
  weight: number;
  label: string;
}

export interface StartupHealthScore {
  compositeScore: number;
  growthScoreNormalized: number;
  humanScoreNormalized: number;
  growthDetails: Record<keyof GrowthMetrics, NormalizedScoreDetail>;
  humanDetails: Record<keyof HumanMetrics, NormalizedScoreDetail>;
}

export interface AppState {
  growthMetrics: GrowthMetrics;
  humanMetrics: HumanMetrics;
  timeSeries: TimeSeriesPoint[];
  heatmapScores: HeatmapScore;
  decisions: Decision[];
  activeStrategicAnalysis: StrategicAnalysisResult | null;
  lastActiveDecision: Decision | null;
}
