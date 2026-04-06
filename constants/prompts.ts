import { Market } from './markets';

export const buildReliabilityPrompt = (car: string, country: string, market: Market): string =>
  `You are an expert automotive researcher with deep knowledge of real-world ownership costs and issues. Research the ${car} for a buyer in ${country}.
Currency: ${market.currency} (${market.symbol}). Fuel measured per ${market.fuelUnit}.
Market context: ${market.notes}

Return ONLY the following compact JSON with no markdown fences, no explanation, no extra whitespace:
{"generation_overview":{"year_range":"","phases":[],"engines":[],"summary":""},"reliability_scores":{"overall":0,"engine":0,"transmission":0,"electrics":0,"suspension":0,"cooling":0,"rust":0},"known_issues":[{"name":"","severity":"Critical","frequency":"Common","description":"","repair_cost":"","affected_variants":""}],"best_model_year":{"buy":{"year":"","reason":""},"engine_pick":{"year":"","reason":""},"avoid":{"year":"","reason":""}},"running_costs":{"service_cost":"","fuel_economy":"","insurance_group":"","road_tax":"","tyre_cost":""}}

Rules:
- reliability_scores are numbers 1.0-10.0
- known_issues: include exactly 7 real documented issues for this specific car
- severity must be one of: Critical, High, Medium, Low
- frequency must be one of: Very Common, Common, Occasional, Rare
- all monetary values in ${market.currency}
- be specific to ${country} market pricing and conditions
- return ONLY compact JSON, no markdown, no explanation`.trim();

export const buildFinancePrompt = (car: string, country: string, market: Market): string =>
  `You are an expert automotive finance analyst and market researcher. Analyse the ${car} for a buyer in ${country}.
Currency: ${market.currency} (${market.symbol}).
Market context: ${market.notes}

Return ONLY the following compact JSON with no markdown fences, no explanation, no extra whitespace:
{"finance_analysis":{"verdict":"Recommend","price_range":"","reasoning":[],"hidden_cost_risk":"","recommendation":""},"competitor_comparison":{"overview":"","pros":[],"cons":[],"head_to_head":{},"verdict":""},"final_verdict":{"buy_if":[],"consider_alternative_if":[],"bottom_line":""}}

Rules:
- verdict must be exactly one of: Recommend, Caution, Avoid
- reasoning: array of 3-4 sentences
- pros: array of 4-5 items
- cons: array of 4-5 items
- head_to_head: object with 4 competitor model names as keys, brief one-sentence comparison as values
- buy_if: array of 3-4 specific buyer scenarios
- consider_alternative_if: array of 3-4 specific scenarios
- all prices in ${market.currency}
- be specific to ${country} market conditions
- return ONLY compact JSON, no markdown, no explanation`.trim();
