import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { MARKET_NAMES } from '../constants/markets';
import { getRecentSearches, getPreferredCountry, savePreferredCountry } from '../services/storage';
import { getActiveProviderAndKey, hasAnyKey, PROVIDER_META } from '../services/apiKeys';
import { RecentSearch } from '../types/report';

export default function HomeScreen() {
  const router = useRouter();
  const [car, setCar] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [showPicker, setShowPicker] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    const [preferred, recent, active] = await Promise.all([
      getPreferredCountry(),
      getRecentSearches(),
      getActiveProviderAndKey(),
    ]);
    if (preferred) setCountry(preferred);
    setRecentSearches(recent);
    setActiveProvider(active ? PROVIDER_META[active.provider].label : null);

    // Show setup modal if no key is configured
    if (!(await hasAnyKey())) {
      setShowSetupModal(true);
    }
  }, []);

  // Reload when screen comes back into focus (e.g. returning from settings)
  useFocusEffect(useCallback(() => { loadState(); }, [loadState]));

  const selectCountry = async (c: string) => {
    setCountry(c);
    setShowPicker(false);
    await savePreferredCountry(c);
  };

  const handleSearch = async () => {
    const trimmed = car.trim();
    if (!trimmed) return;
    const active = await getActiveProviderAndKey();
    if (!active) {
      setShowSetupModal(true);
      return;
    }
    router.push({ pathname: '/loading', params: { car: trimmed, country } });
  };

  const handleRecent = (s: RecentSearch) => {
    setCar(s.car);
    setCountry(s.country);
  };

  const canSearch = car.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* No-key setup modal */}
      <Modal visible={showSetupModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>\uD83D\uDD11</Text>
            <Text style={styles.modalTitle}>Add an AI Key</Text>
            <Text style={styles.modalBody}>
              CarIQ needs an API key to research cars. You can use Claude, Gemini, or ChatGPT.
              Your key is stored only on this device.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => { setShowSetupModal(false); router.push('/settings'); }}
            >
              <Text style={styles.modalBtnText}>Set up API Key</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSkip}
              onPress={() => setShowSetupModal(false)}
            >
              <Text style={styles.modalSkipText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View style={styles.logoRow}>
                <View style={styles.logoDot} />
                <Text style={styles.logo}>CarIQ</Text>
              </View>
              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={() => router.push('/settings')}
              >
                <Text style={styles.settingsIcon}>\u2699\uFE0F</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.tagline}>AI Car Research & Buyer's Guide</Text>
            {activeProvider && (
              <View style={styles.providerChip}>
                <View style={styles.providerDot} />
                <Text style={styles.providerChipText}>{activeProvider}</Text>
              </View>
            )}
          </View>

          {/* Search Card */}
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Car make, model & year</Text>
            <TextInput
              style={styles.input}
              value={car}
              onChangeText={setCar}
              placeholder="e.g. Porsche Cayenne 958 2012 diesel"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>Market & Currency</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowPicker((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerText}>{country}</Text>
              <Text style={styles.chevron}>{showPicker ? '\u25b2' : '\u25bc'}</Text>
            </TouchableOpacity>

            {showPicker && (
              <View style={styles.dropdown}>
                {MARKET_NAMES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.dropdownItem, m === country && styles.dropdownItemActive]}
                    onPress={() => selectCountry(m)}
                  >
                    <Text style={[styles.dropdownText, m === country && styles.dropdownTextActive]}>
                      {m}
                    </Text>
                    {m === country && <Text style={styles.checkmark}>\u2713</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, !canSearch && styles.buttonDisabled]}
              onPress={handleSearch}
              disabled={!canSearch}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Research This Car</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionLabel}>Recent Searches</Text>
              {recentSearches.slice(0, 5).map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.recentItem}
                  onPress={() => handleRecent(s)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentLeft}>
                    <Text style={styles.recentCar}>{s.car}</Text>
                    <Text style={styles.recentCountry}>{s.country}</Text>
                  </View>
                  <Text style={styles.recentArrow}>\u203a</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.footerTip}>Powered by AI \u00b7 Results in ~30 seconds</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 56 },

  header: { marginTop: 16, marginBottom: 28 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  logo: { fontSize: 38, fontWeight: '800', color: COLORS.text, letterSpacing: -1.5 },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 18 },
  tagline: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  providerChipText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  picker: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  pickerText: { color: COLORS.text, fontSize: 15 },
  chevron: { color: COLORS.textMuted, fontSize: 10 },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemActive: { backgroundColor: `${COLORS.accent}18` },
  dropdownText: { fontSize: 14, color: COLORS.textSecondary },
  dropdownTextActive: { color: COLORS.accent, fontWeight: '600' },
  checkmark: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.38 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  recentSection: { marginTop: SPACING.xl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 12,
  },
  recentItem: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentLeft: { flex: 1 },
  recentCar: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  recentCountry: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  recentArrow: { fontSize: 22, color: COLORS.textMuted },

  footerTip: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 28 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalIcon: { fontSize: 40, marginBottom: SPACING.md },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.lg,
  },
  modalBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalSkip: { paddingVertical: 8 },
  modalSkipText: { color: COLORS.textMuted, fontSize: 13 },
});
