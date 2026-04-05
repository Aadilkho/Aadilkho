import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { MARKET_NAMES } from '../constants/markets';
import {
  getRecentSearches,
  getPreferredCountry,
  savePreferredCountry,
} from '../services/storage';
import { RecentSearch } from '../types/report';

export default function HomeScreen() {
  const router = useRouter();
  const [car, setCar] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [showPicker, setShowPicker] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    (async () => {
      const preferred = await getPreferredCountry();
      if (preferred) setCountry(preferred);
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    })();
  }, []);

  const selectCountry = async (c: string) => {
    setCountry(c);
    setShowPicker(false);
    await savePreferredCountry(c);
  };

  const handleSearch = () => {
    const trimmed = car.trim();
    if (!trimmed) return;
    router.push({ pathname: '/loading', params: { car: trimmed, country } });
  };

  const handleRecent = (s: RecentSearch) => {
    setCar(s.car);
    setCountry(s.country);
  };

  const canSearch = car.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoDot} />
              <Text style={styles.logo}>CarIQ</Text>
            </View>
            <Text style={styles.tagline}>AI Car Research & Buyer's Guide</Text>
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
                    style={[
                      styles.dropdownItem,
                      m === country && styles.dropdownItemActive,
                    ]}
                    onPress={() => selectCountry(m)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        m === country && styles.dropdownTextActive,
                      ]}
                    >
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

          <Text style={styles.footerTip}>Powered by Claude AI \u00b7 Results in ~30 seconds</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 56 },

  header: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1.5,
  },
  tagline: { fontSize: 13, color: COLORS.textMuted },

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

  footerTip: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 28,
  },
});
