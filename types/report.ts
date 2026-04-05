export interface GenerationOverview {
  yearRange: string;
  phases: string[];
  engines: string[];
  summary: string;
}

export interface ReliabilityScores {
  overall: number;
  engine: number;
  transmission: number;
  electrics: number;
  suspension: number;
  cooling: number;
  rust: number;
}

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Frequency = 'Very Common' | 'Common' | 'Occasional' | 'Rare';

export interface KnownIssue {
  name: string;
  severity: Severity;
  frequency: Frequency;
  description: string;
  repairCost: string;
  affectedVariants: string;
}

export interface BestModelYear {
  buy: { year: string; reason: string };
  enginePick: { year: string; reason: string };
  avoid: { year: string; reason: string };
}

export interface RunningCosts {
  serviceCost: string;
  fuelEconomy: string;
  insuranceGroup: string;
  roadTax: string;
  tyreCost: string;
}

export type FinanceVerdict = 'Recommend' | 'Caution' | 'Avoid';

export interface FinanceAnalysis {
  verdict: FinanceVerdict;
  priceRange: string;
  reasoning: string[];
  hiddenCostRisk: string;
  recommendation: string;
}

export interface CompetitorComparison {
  overview: string;
  pros: string[];
  cons: string[];
  headToHead: Record<string, string>;
  verdict: string;
}

export interface FinalVerdict {
  buyIf: string[];
  considerAlternativeIf: string[];
  bottomLine: string;
}

export interface CarReport {
  car: string;
  country: string;
  currency: string;
  generatedAt: string;
  generationOverview: GenerationOverview;
  reliabilityScores: ReliabilityScores;
  knownIssues: KnownIssue[];
  bestModelYear: BestModelYear;
  runningCosts: RunningCosts;
  financeAnalysis: FinanceAnalysis;
  competitorComparison: CompetitorComparison;
  finalVerdict: FinalVerdict;
}

export interface RecentSearch {
  car: string;
  country: string;
  timestamp: number;
}
