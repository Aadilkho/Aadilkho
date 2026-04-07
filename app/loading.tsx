import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { researchCar } from '../services/anthropicApi';
import { saveRecentSearch, cacheReport } from '../services/storage';
import { getActiveProviderAndKey, PROVIDER_META } from '../services/apiKeys';

const STEPS = [
  {
    label: 'Researching reliability & known issues...',
    sub: 'Analysing build quality, common faults & repair history',
  },
  {
    label: 'Analysing running costs & market data...',
    sub: 'Checking finance options, competitors & local pricing',
  },
];

export default function LoadingScreen() {
  const router = useRouter();
  const { car, country } = useLocalSearchParams<{ car: string; country: string }>();
  const [step, setStep] = useState(0);
  const [providerLabel, setProviderLabel] = useState('');
  const spin = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1400, useNativeDriver: true })
    ).start();
    Animated.timing(progress, { toValue: 0.45, duration: 1200, useNativeDriver: false }).start();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const active = await getActiveProviderAndKey();
        setProviderLabel(active.free ? 'Free · Gemini' : PROVIDER_META[active.provider].label);

        const report = await researchCar(active.provider, active.key, car, country, (s) => {
          setStep(s - 1);
          Animated.timing(progress, {
            toValue: s === 1 ? 0.5 : 0.95,
            duration: 500,
            useNativeDriver: false,
          }).start();
        });

        await saveRecentSearch(car, country);
        await cacheReport(car, country, report);
        router.replace({ pathname: '/report', params: { reportJson: JSON.stringify(report) } });
      } catch (err: any) {
        router.replace({
          pathname: '/report',
          params: { error: err?.message ?? 'Unknown error' },
        });
      }
    };
    run();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.spinnerRing}>
          <Animated.Text style={[styles.spinnerIcon, { transform: [{ rotate }] }]}>
            \u2699
          </Animated.Text>
        </View>

        <Text style={styles.carName}>{car}</Text>
        <Text style={styles.country}>{country}</Text>

        {providerLabel ? (
          <View style={styles.providerPill}>
            <View style={styles.providerDot} />
            <Text style={styles.providerText}>{providerLabel}</Text>
          </View>
        ) : null}

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={i} style={[styles.stepRow, i > step && styles.stepFaded]}>
              <View style={[styles.dot, i <= step && styles.dotActive, i < step && styles.dotDone]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{s.label}</Text>
                {i === step && <Text style={styles.stepSub}>{s.sub}</Text>}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.hint}>Usually takes 20\u201340 seconds</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  spinnerRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  spinnerIcon: { fontSize: 34, color: COLORS.accent },
  carName: { fontSize: 20, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  country: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  providerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  providerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  providerText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 2 },
  steps: { width: '100%', gap: 20, marginBottom: SPACING.xl },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepFaded: { opacity: 0.3 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.border, marginTop: 5, flexShrink: 0 },
  dotActive: { backgroundColor: COLORS.accent },
  dotDone: { backgroundColor: COLORS.success },
  stepLabel: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
  stepLabelActive: { color: COLORS.text },
  stepSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  hint: { fontSize: 12, color: COLORS.textMuted },
});
