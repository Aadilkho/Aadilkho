export interface Market {
  currency: string;
  symbol: string;
  fuelUnit: string;
  notes: string;
}

export const MARKETS: Record<string, Market> = {
  'South Africa': {
    currency: 'ZAR',
    symbol: 'R',
    fuelUnit: 'litre',
    notes: 'Factor in load-shedding impact on electric components, SA road conditions and potholes, import duties on parts, Porsche Centre SA and independent specialist pricing, and general SA economic conditions.',
  },
  'United Kingdom': {
    currency: 'GBP',
    symbol: '\u00a3',
    fuelUnit: 'litre',
    notes: 'Factor in UK road tax VED bands, ULEZ and CAZ zones, PCP and HP finance rates, MOT requirements, and UK used car market pricing from dealers and auction.',
  },
  'United States': {
    currency: 'USD',
    symbol: '$',
    fuelUnit: 'gallon',
    notes: 'Factor in US state registration costs, CarMax and auction pricing, emissions testing requirements by state, US insurance rates, and availability of parts.',
  },
  'Australia': {
    currency: 'AUD',
    symbol: 'A$',
    fuelUnit: 'litre',
    notes: 'Factor in PPSR checks, stamp duty by state, CTP insurance, Luxury Car Tax (LCT), and Australian used car market pricing from Carsales and dealers.',
  },
  'UAE': {
    currency: 'AED',
    symbol: 'AED',
    fuelUnit: 'litre',
    notes: 'Factor in low fuel costs, extreme desert heat impact on cooling systems and tyres, RTA registration fees, and UAE used car market pricing.',
  },
  'Germany': {
    currency: 'EUR',
    symbol: '\u20ac',
    fuelUnit: 'litre',
    notes: 'Factor in TUV/HU inspection requirements, German autobahn high-speed driving wear, EU emissions regulations, and German used car market pricing from Mobile.de.',
  },
};

export const MARKET_NAMES = Object.keys(MARKETS);
