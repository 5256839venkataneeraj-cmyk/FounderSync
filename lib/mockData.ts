// Realistic seeded mock data and deterministic AI fallback generators for FounderSync
import {
  GrowthMetrics,
  HumanMetrics,
  TimeSeriesPoint,
  HeatmapScore,
  Decision,
  RealityCheckResult,
  StrategicAnalysisResult,
  StartupHealthScore,
  AppState,
} from '@/types';

export const INITIAL_GROWTH_METRICS: GrowthMetrics = {
  arr: 1450000, // $1.45M ARR
  churnRate: 3.8, // 3.8% monthly churn
  ltv: 24500, // $24,500 LTV
  burnRate: 85000, // $85,000/mo burn rate
};

export const INITIAL_HUMAN_METRICS: HumanMetrics = {
  burnoutIndex: 68, // 68/100 (elevated burnout risk)
  customerTrustScore: 84, // 84/100 (strong trust)
  founderCognitiveLoad: 79, // 79/100 (high cognitive load)
  retentionSentiment: 62, // 62/100 (moderate retention willingness)
};

export const INITIAL_TIME_SERIES: TimeSeriesPoint[] = [
  { month: 'Oct 25', revenueGrowth: 6.2, teamWellnessIndex: 82 },
  { month: 'Nov 25', revenueGrowth: 7.5, teamWellnessIndex: 80 },
  { month: 'Dec 25', revenueGrowth: 8.1, teamWellnessIndex: 78 },
  { month: 'Jan 26', revenueGrowth: 11.4, teamWellnessIndex: 72 },
  { month: 'Feb 26', revenueGrowth: 13.8, teamWellnessIndex: 67 },
  { month: 'Mar 26', revenueGrowth: 15.2, teamWellnessIndex: 61 },
  { month: 'Apr 26', revenueGrowth: 17.0, teamWellnessIndex: 54 },
  { month: 'May 26', revenueGrowth: 14.5, teamWellnessIndex: 50 },
  { month: 'Jun 26', revenueGrowth: 18.2, teamWellnessIndex: 46 },
  { month: 'Jul 26', revenueGrowth: 19.8, teamWellnessIndex: 42 },
  { month: 'Aug 26', revenueGrowth: 16.4, teamWellnessIndex: 48 },
  { month: 'Sep 26', revenueGrowth: 15.0, teamWellnessIndex: 53 },
];

export const INITIAL_HEATMAP_SCORES: HeatmapScore = {
  marketFeasibility: 86,
  teamSustainability: 48, // Low score creates an active imbalance (86 - 48 = 38 > 30)
  unitEconomics: 74,
  customerValue: 82,
};

export const INITIAL_STRATEGIC_ANALYSIS: StrategicAnalysisResult = {
  summary: 'Established product-market fit in mid-market B2B with healthy $24.5k LTV and durable 3.8% monthly churn, but growth velocity is plateauing near $1.45M ARR.',
  strengths: [
    'Resilient unit economics with healthy $24.5k LTV and 3.8% monthly churn.',
    'Strong customer trust index (84/100) providing pricing moat and expansion foundation.',
  ],
  risks: [
    'Elevated Team Burnout Index (68/100) threatens key contributor attrition.',
    'High Founder Cognitive Load (79/100) creates strategic decision bottlenecks.',
  ],
  recommendations: [
    'Expand ACV via enterprise security & compliance add-on tier.',
    'Automate non-core customer onboarding workflows to lift gross margins from 72% to 81%.',
    'Establish sustainable sprint pacing to relieve architect burnout.',
  ],
  confidence: 0.88,
  model: 'gemini-3.1-flash-lite (baseline)',
  simulated: true,
  generatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
};

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: '33333333-3333-3333-3333-333333333331',
    reality_check_id: '22222222-2222-2222-2222-222222222221',
    action: 'PIVOT_STRATEGY',
    justification: 'Reviewed devil advocate warnings; agreed that risking senior architect departures permanently threatens our enterprise roadmap. Scoped down MVP instead.',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    reality_checks: {
      strategyEvaluated: 'Mandate 80-hour work weeks for Q3 to pull forward enterprise feature release by 6 weeks.',
      counterarguments: [
        'Cut non-essential scope by 35% and preserve release deadline with normal working hours and staggered team sprints.',
        'Technical debt and regression rate increases exponentially under sustained fatigue.',
      ],
      blindSpots: [
        'Critical engineering churn risk among senior core architecture leads.',
        'Customer satisfaction degradation if rushed features produce production downtime.',
      ],
      verdict: 'reconsider',
      model: 'grok-4.5',
      simulated: true,
      generatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333332',
    reality_check_id: '22222222-2222-2222-2222-222222222222',
    action: 'ACCEPT_AND_OVERRIDE_AI',
    justification: 'We have analyzed unit economics and determined that our legacy tier cost-to-serve exceeds revenues. We accept churn risk to focus on mid-market profitability.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    reality_checks: {
      strategyEvaluated: 'Increase subscription pricing by 45% immediately for all grandfathered SMB customers.',
      counterarguments: [
        'Introduce grandfathered tier with feature caps, while applying new pricing exclusively to new signups and opt-in upgrade tiers.',
        'Spike in gross monthly churn neutralizing short-term expansion MRR.',
      ],
      blindSpots: [
        'Vocal community backlash on founder social channels and review aggregators.',
        'Competitors will run targeted migration campaigns targeting alienated early adopters.',
      ],
      verdict: 'proceed_with_caution',
      model: 'grok-4.5',
      simulated: true,
      generatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  },
];

export const SEED_APP_STATE: AppState = {
  growthMetrics: INITIAL_GROWTH_METRICS,
  humanMetrics: INITIAL_HUMAN_METRICS,
  timeSeries: INITIAL_TIME_SERIES,
  heatmapScores: INITIAL_HEATMAP_SCORES,
  decisions: INITIAL_DECISIONS,
  activeStrategicAnalysis: INITIAL_STRATEGIC_ANALYSIS,
  lastActiveDecision: null,
};

export { generateMockStrategicAnalysis } from '@/lib/gemini';
export { generateMockRealityCheck } from '@/lib/grok';
