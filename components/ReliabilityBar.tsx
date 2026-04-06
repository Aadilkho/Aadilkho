import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../constants/theme';

interface Props {
  label: string;
  score: number;
  index?: number;
}

function scoreColor(score: number): string {
  if (score >= 7.5) return COLORS.success;
  if (score >= 5.5) return COLORS.warning;
  return COLORS.error;
}

export default function ReliabilityBar({ label, score, index = 0 }: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(index * 80, withTiming(score / 10, { duration: 700 }));
  }, [score, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const color = scoreColor(score);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>
        <Text style={[styles.score, { color }]}>{score.toFixed(1)}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  score: { fontSize: 13, fontWeight: '700' },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
});
