import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { KnownIssue, Severity } from '../types/report';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  issue: KnownIssue;
}

function severityColor(s: Severity): string {
  switch (s) {
    case 'Critical': return COLORS.critical;
    case 'High': return COLORS.high;
    case 'Medium': return COLORS.medium;
    default: return COLORS.low;
  }
}

export default function IssueCard({ issue }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = severityColor(issue.severity);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={toggle} style={styles.container}>
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={expanded ? undefined : 1}>{issue.name}</Text>
          <View style={[styles.severityBadge, { backgroundColor: `${color}18`, borderColor: color }]}>
            <Text style={[styles.severityText, { color }]}>{issue.severity}</Text>
          </View>
        </View>
        <Text style={styles.frequency}>{issue.frequency}</Text>
        {expanded && (
          <View style={styles.details}>
            <Text style={styles.description}>{issue.description}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Est. Repair</Text>
                <Text style={styles.metaValue}>{issue.repairCost}</Text>
              </View>
              <View style={[styles.metaItem, { flex: 1.5 }]}>
                <Text style={styles.metaLabel}>Affects</Text>
                <Text style={styles.metaValue}>{issue.affectedVariants}</Text>
              </View>
            </View>
          </View>
        )}
        <Text style={styles.expandHint}>{expanded ? '▲ collapse' : '▼ tap for details'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardElevated,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accentBar: { width: 3 },
  content: { flex: 1, padding: SPACING.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  name: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  severityText: { fontSize: 11, fontWeight: '700' },
  frequency: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  details: { marginTop: 10 },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: {},
  metaLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  metaValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  expandHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },
});
