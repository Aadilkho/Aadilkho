import { CarReport, KnownIssue } from '../types/report';
import { MARKETS, Market } from '../constants/markets';
import { buildReliabilityPrompt, buildFinancePrompt } from '../constants/prompts';
import { Provider } from './apiKeys';
import { callProvider } from './providers';

function safeParseJSON(raw: string): any {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in API response');
  return JSON.parse(raw.slice(start, end + 1));
}

export type ProgressCallback = (step: 1 | 2) => void;

export async function researchCar(
  provider: Provider,
  apiKey: string,
  car: string,
  country: string,
  onProgress: ProgressCallback
): Promise<CarReport> {
  const market: Market = MARKETS[country];
  if (!market) throw new Error(`Unknown market: ${country}`);

  // Call 1: Reliability & Issues
  onProgress(1);
  const raw1 = await callProvider(provider, apiKey, buildReliabilityPrompt(car, country, market));
  const d1 = safeParseJSON(raw1);

  // Call 2: Finance & Competitors
  onProgress(2);
  const raw2 = await callProvider(provider, apiKey, buildFinancePrompt(car, country, market));
  const d2 = safeParseJSON(raw2);

  const go = d1.generation_overview ?? {};
  const rs = d1.reliability_scores ?? {};
  const bmy = d1.best_model_year ?? {};
  const rc = d1.running_costs ?? {};
  const fa = d2.finance_analysis ?? {};
  const cc = d2.competitor_comparison ?? {};
  const fv = d2.final_verdict ?? {};

  return {
    car,
    country,
    currency: market.currency,
    generatedAt: new Date().toISOString(),
    generationOverview: {
      yearRange: go.year_range ?? '',
      phases: go.phases ?? [],
      engines: go.engines ?? [],
      summary: go.summary ?? '',
    },
    reliabilityScores: {
      overall: rs.overall ?? 0,
      engine: rs.engine ?? 0,
      transmission: rs.transmission ?? 0,
      electrics: rs.electrics ?? 0,
      suspension: rs.suspension ?? 0,
      cooling: rs.cooling ?? 0,
      rust: rs.rust ?? 0,
    },
    knownIssues: (d1.known_issues ?? []).map((i: any): KnownIssue => ({
      name: i.name ?? '',
      severity: i.severity ?? 'Medium',
      frequency: i.frequency ?? 'Occasional',
      description: i.description ?? '',
      repairCost: i.repair_cost ?? '',
      affectedVariants: i.affected_variants ?? '',
    })),
    bestModelYear: {
      buy: { year: bmy.buy?.year ?? '', reason: bmy.buy?.reason ?? '' },
      enginePick: { year: bmy.engine_pick?.year ?? '', reason: bmy.engine_pick?.reason ?? '' },
      avoid: { year: bmy.avoid?.year ?? '', reason: bmy.avoid?.reason ?? '' },
    },
    runningCosts: {
      serviceCost: rc.service_cost ?? '',
      fuelEconomy: rc.fuel_economy ?? '',
      insuranceGroup: rc.insurance_group ?? '',
      roadTax: rc.road_tax ?? '',
      tyreCost: rc.tyre_cost ?? '',
    },
    financeAnalysis: {
      verdict: fa.verdict ?? 'Caution',
      priceRange: fa.price_range ?? '',
      reasoning: fa.reasoning ?? [],
      hiddenCostRisk: fa.hidden_cost_risk ?? '',
      recommendation: fa.recommendation ?? '',
    },
    competitorComparison: {
      overview: cc.overview ?? '',
      pros: cc.pros ?? [],
      cons: cc.cons ?? [],
      headToHead: cc.head_to_head ?? {},
      verdict: cc.verdict ?? '',
    },
    finalVerdict: {
      buyIf: fv.buy_if ?? [],
      considerAlternativeIf: fv.consider_alternative_if ?? [],
      bottomLine: fv.bottom_line ?? '',
    },
  };
}
