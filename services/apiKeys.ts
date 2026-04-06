import AsyncStorage from '@react-native-async-storage/async-storage';

export type Provider = 'anthropic' | 'gemini' | 'openai';

export interface ApiKeys {
  anthropic?: string;
  gemini?: string;
  openai?: string;
}

const STORAGE_KEYS = {
  PROVIDER: 'cariq_selected_provider',
  API_KEYS: 'cariq_api_keys',
};

export const PROVIDER_META: Record<Provider, { label: string; model: string; keyLabel: string; keyPlaceholder: string; docsUrl: string }> = {
  anthropic: {
    label: 'Claude',
    model: 'claude-sonnet-4-20250514',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    docsUrl: 'console.anthropic.com',
  },
  gemini: {
    label: 'Gemini',
    model: 'gemini-1.5-pro',
    keyLabel: 'Google AI API Key',
    keyPlaceholder: 'AIza...',
    docsUrl: 'aistudio.google.com',
  },
  openai: {
    label: 'ChatGPT',
    model: 'gpt-4o',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    docsUrl: 'platform.openai.com',
  },
};

export const PROVIDER_ORDER: Provider[] = ['anthropic', 'gemini', 'openai'];

export async function getApiKeys(): Promise<ApiKeys> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.API_KEYS);
    return raw ? (JSON.parse(raw) as ApiKeys) : {};
  } catch {
    return {};
  }
}

export async function saveApiKey(provider: Provider, key: string): Promise<void> {
  try {
    const existing = await getApiKeys();
    const updated = { ...existing, [provider]: key.trim() };
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(updated));
  } catch {}
}

export async function deleteApiKey(provider: Provider): Promise<void> {
  try {
    const existing = await getApiKeys();
    delete existing[provider];
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(existing));
  } catch {}
}

export async function getSelectedProvider(): Promise<Provider> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROVIDER);
    return (raw as Provider) ?? 'anthropic';
  } catch {
    return 'anthropic';
  }
}

export async function saveSelectedProvider(provider: Provider): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  } catch {}
}

export async function getActiveProviderAndKey(): Promise<{ provider: Provider; key: string } | null> {
  const [keys, provider] = await Promise.all([getApiKeys(), getSelectedProvider()]);
  const key = keys[provider];
  if (key) return { provider, key };
  // Fallback to any available key
  for (const p of PROVIDER_ORDER) {
    if (keys[p]) return { provider: p, key: keys[p]! };
  }
  return null;
}

export async function hasAnyKey(): Promise<boolean> {
  const keys = await getApiKeys();
  return PROVIDER_ORDER.some((p) => !!keys[p]);
}
