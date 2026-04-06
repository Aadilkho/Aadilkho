import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FinanceVerdict } from '../types/report';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  verdict: FinanceVerdict;
  size?: 'sm' | 'md' | 'lg';
}

function verdictStyle(v: FinanceVerdict) {
  switch (v) {
    case 'Recommend':
      return { color: COLORS.success, bg: COLORS.successBg, border: COLORS.successBorder, icon: '\u2713' };
    case 'Caution':
      return { color: COLORS.warning, bg: COLORS.warningBg, border: COLORS.warningBorder, icon: '!' };
    default:
      return { color: COLORS.error, bg: COLORS.errorBg, border: COLORS.errorBorder, icon: '\u00d7' };
  }
}

export default function FinanceBadge({ verdict, size = 'md' }: Props) {
  const vs = verdictStyle(verdict);
  const fontSize = size === 'lg' ? 15 : size === 'sm' ? 11 : 13;
  const px = size === 'lg' ? 16 : size === 'sm' ? 10 : 12;
  const py = size === 'lg' ? 8 : size === 'sm' ? 3 : 5;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: vs.bg, borderColor: vs.border, paddingHorizontal: px, paddingVertical: py },
      ]}
    >
      <Text style={[styles.icon, { color: vs.color, fontSize }]}>{vs.icon}</Text>
      <Text style={[styles.text, { color: vs.color, fontSize }]}>{verdict}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 5,
  },
  icon: { fontWeight: '700' },
  text: { fontWeight: '700', letterSpacing: 0.2 },
});
