import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import {
  Provider,
  PROVIDER_META,
  PROVIDER_ORDER,
  ApiKeys,
  getApiKeys,
  saveApiKey,
  deleteApiKey,
  getSelectedProvider,
  saveSelectedProvider,
} from '../services/apiKeys';

const PROVIDER_ICONS: Record<Provider, string> = {
  anthropic: '\u{1F9E0}',
  gemini: '\u2728',
  openai: '\u{1F916}',
};

const PROVIDER_SUBTITLE: Record<Provider, string> = {
  anthropic: 'Best reasoning & analysis',
  gemini: 'Great for research & speed',
  openai: 'Widely used, highly capable',
};

export default function SettingsScreen() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeys>({});
  const [drafts, setDrafts] = useState<Partial<Record<Provider, string>>>({
    anthropic: '',
    gemini: '',
    openai: '',
  });
  const [visible, setVisible] = useState<Partial<Record<Provider, boolean>>>({
    anthropic: false,
    gemini: false,
    openai: false,
  });
  const [selected, setSelected] = useState<Provider>('anthropic');
  const [saving, setSaving] = useState<Provider | null>(null);

  const load = useCallback(async () => {
    const [stored, provider] = await Promise.all([getApiKeys(), getSelectedProvider()]);
    setKeys(stored);
    setSelected(provider);
    setDrafts({
      anthropic: stored.anthropic ?? '',
      gemini: stored.gemini ?? '',
      openai: stored.openai ?? '',
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (provider: Provider) => {
    const value = (drafts[provider] ?? '').trim();
    if (!value) {
      Alert.alert('Empty key', 'Please paste your API key before saving.');
      return;
    }
    setSaving(provider);
    await saveApiKey(provider, value);
    setKeys((prev) => ({ ...prev, [provider]: value }));
    await saveSelectedProvider(provider);
    setSelected(provider);
    setSaving(null);
    Alert.alert('Saved', `${PROVIDER_META[provider].label} key saved and set as active provider.`);
  };

  const handleDelete = (provider: Provider) => {
    Alert.alert(
      'Remove key',
      `Remove your ${PROVIDER_META[provider].label} API key?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteApiKey(provider);
            setKeys((prev) => { const next = { ...prev }; delete next[provider]; return next; });
            setDrafts((prev) => ({ ...prev, [provider]: '' }));
            if (selected === provider) {
              const fallback = PROVIDER_ORDER.find((p) => p !== provider && keys[p]);
              if (fallback) {
                await saveSelectedProvider(fallback);
                setSelected(fallback);
              }
            }
          },
        },
      ]
    );
  };

  const handleSelectProvider = async (provider: Provider) => {
    if (!keys[provider]) {
      Alert.alert('No key saved', `Add your ${PROVIDER_META[provider].label} API key first.`);
      return;
    }
    await saveSelectedProvider(provider);
    setSelected(provider);
  };

  const hasSaved = (p: Provider) => !!keys[p];
  const isDraft = (p: Provider) => (drafts[p] ?? '').trim() !== (keys[p] ?? '');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>\u2039 Back</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>AI Settings</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHint}>
            Keys are stored only on this device and sent directly to each provider's API.
          </Text>

          {PROVIDER_ORDER.map((provider) => {
            const meta = PROVIDER_META[provider];
            const saved = hasSaved(provider);
            const isActive = selected === provider;
            const draft = drafts[provider] ?? '';
            const show = visible[provider];

            return (
              <View key={provider} style={[styles.card, isActive && saved && styles.cardActive]}>
                <View style={styles.cardHeader}>
                  <View style={styles.providerInfo}>
                    <View style={styles.iconWrap}>
                      <Text style={styles.providerIcon}>{PROVIDER_ICONS[provider]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.providerName}>{meta.label}</Text>
                        {isActive && saved && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>ACTIVE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.providerModel}>{meta.model}</Text>
                      <Text style={styles.providerSubtitle}>{PROVIDER_SUBTITLE[provider]}</Text>
                    </View>
                  </View>
                  {saved && (
                    <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelectProvider(provider)}>
                      <Text style={[styles.selectBtnText, isActive && styles.selectBtnActive]}>
                        {isActive ? '\u2713 Selected' : 'Use this'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {saved && (
                  <View style={styles.savedRow}>
                    <View style={styles.savedDot} />
                    <Text style={styles.savedText}>Key saved</Text>
                    <TouchableOpacity onPress={() => handleDelete(provider)} style={styles.removeBtn}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.inputLabel}>{meta.keyLabel}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={draft}
                    onChangeText={(v) => setDrafts((prev) => ({ ...prev, [provider]: v }))}
                    placeholder={saved ? '(saved \u2014 paste to update)' : meta.keyPlaceholder}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setVisible((prev) => ({ ...prev, [provider]: !show }))}
                  >
                    <Text style={styles.eyeIcon}>{show ? '\uD83D\uDE48' : '\uD83D\uDC41'}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.docsHint}>Get your key at {meta.docsUrl}</Text>

                <TouchableOpacity
                  style={[styles.saveBtn, (!isDraft(provider) || saving === provider) && styles.saveBtnDisabled]}
                  onPress={() => handleSave(provider)}
                  disabled={!isDraft(provider) || saving === provider}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>
                    {saving === provider ? 'Saving...' : saved ? 'Update Key' : 'Save Key'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Which provider should I use?</Text>
            <Text style={styles.infoText}>
              {'\uD83E\uDDE0 '}<Text style={{ color: COLORS.text, fontWeight: '600' }}>Claude</Text>{' gives the most detailed and accurate car research. Recommended.\n\n'}
              {'\u2728 '}<Text style={{ color: COLORS.text, fontWeight: '600' }}>Gemini</Text>{' is fast and free to try via Google AI Studio.\n\n'}
              {'\uD83E\uDD16 '}<Text style={{ color: COLORS.text, fontWeight: '600' }}>ChatGPT</Text>{' (gpt-4o) works well and is widely available.'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backText: { color: COLORS.accent, fontSize: 17 },
  topTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  content: { padding: SPACING.md, paddingBottom: 48 },
  sectionHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardActive: { borderColor: COLORS.accent, borderWidth: 1.5 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: 8,
  },
  providerInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexShrink: 0,
  },
  providerIcon: { fontSize: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' },
  providerName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  activePill: {
    backgroundColor: `${COLORS.accent}20`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${COLORS.accent}50`,
  },
  activePillText: { fontSize: 10, fontWeight: '700', color: COLORS.accent, letterSpacing: 0.5 },
  providerModel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  providerSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  selectBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexShrink: 0,
  },
  selectBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  selectBtnActive: { color: COLORS.accent },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: SPACING.md,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  savedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  savedText: { fontSize: 12, color: COLORS.success, fontWeight: '600', flex: 1 },
  removeBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  removeText: { fontSize: 12, color: COLORS.error, fontWeight: '600' },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeBtn: { padding: SPACING.sm, marginLeft: 8 },
  eyeIcon: { fontSize: 18 },
  docsHint: { fontSize: 11, color: COLORS.textMuted, marginBottom: 12 },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.3 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  infoBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  infoText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});
