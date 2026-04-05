import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarReport, RecentSearch } from '../types/report';

const KEYS = {
  RECENT_SEARCHES: 'cariq_recent_searches',
  REPORT_CACHE_PREFIX: 'cariq_report_',
  PREFERRED_COUNTRY: 'cariq_preferred_country',
};

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cacheKey(car: string, country: string): string {
  return `${KEYS.REPORT_CACHE_PREFIX}${car}-${country}`.toLowerCase().replace(/\s+/g, '_');
}

export async function saveRecentSearch(car: string, country: string): Promise<void> {
  try {
    const existing = await getRecentSearches();
    const updated: RecentSearch[] = [
      { car, country, timestamp: Date.now() },
      ...existing.filter((s) => !(s.car === car && s.country === country)),
    ].slice(0, 10);
    await AsyncStorage.setItem(KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  } catch (_) {}
}

export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RECENT_SEARCHES);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch (_) {
    return [];
  }
}

export async function cacheReport(car: string, country: string, report: CarReport): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(car, country), JSON.stringify({ report, cachedAt: Date.now() }));
  } catch (_) {}
}

export async function getCachedReport(car: string, country: string): Promise<CarReport | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(car, country));
    if (!raw) return null;
    const { report, cachedAt } = JSON.parse(raw) as { report: CarReport; cachedAt: number };
    if (Date.now() - cachedAt > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(cacheKey(car, country));
      return null;
    }
    return report;
  } catch (_) {
    return null;
  }
}

export async function savePreferredCountry(country: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PREFERRED_COUNTRY, country);
  } catch (_) {}
}

export async function getPreferredCountry(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.PREFERRED_COUNTRY);
  } catch (_) {
    return null;
  }
}
