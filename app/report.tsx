import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { CarReport } from '../types/report';
import SectionCard from '../components/SectionCard';
import ReliabilityBar from '../components/ReliabilityBar';
import IssueCard from '../components/IssueCard';
import FinanceBadge from '../components/FinanceBadge';
import { exportReportPDF } from '../services/pdfExport';

export default function ReportScreen() {
  const { reportJson, error } = useLocalSearchParams<{ reportJson?: string; error?: string }>();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  const report: CarReport | null = useMemo(() => {
    if (!reportJson) return null;
    try {
      return JSON.parse(reportJson) as CarReport;
    } catch {
      return null;
    }
  }, [reportJson]);

  const handleExport = async () => {
    if (!report || exporting) return;
    setExporting(true);
    try {
      await exportReportPDF(report);
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorIcon}>\u26a0\ufe0f</Text>
          <Text style={styles.errorTitle}>Research Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const scores = Object.entries(report.reliabilityScores) as [string, number][];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>\u2039 Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{report.car}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{report.car}</Text>
          <View style={styles.heroChips}>
            <Chip label={report.country} />
            <Chip label={report.currency} />
            <Chip label={report.generationOverview.yearRange} />
          </View>
          <Text style={styles.heroSummary}>{report.generationOverview.summary}</Text>
        </View>

        {/* 1. Generation Overview */}
        <SectionCard title="Generation Overview">
          <TableRow label="Year Range" value={report.generationOverview.yearRange} />
          <TableRow label="Phases" value={report.generationOverview.phases.join(', ')} />
          <TableRow label="Engines" value={report.generationOverview.engines.join(', ')} last />
        </SectionCard>

        {/* 2. Reliability */}
        <SectionCard title="Reliability Scores">
          {scores.map(([key, val], i) => (
            <ReliabilityBar key={key} label={key} score={val} index={i} />
          ))}
        </SectionCard>

        {/* 3. Known Issues */}
        <SectionCard title={`Known Issues (${report.knownIssues.length})`}>
          {report.knownIssues.map((issue, i) => (
            <IssueCard key={i} issue={issue} />
          ))}
        </SectionCard>

        {/* 4. Best Model Year */}
        <SectionCard title="Best Model Year">
          <YearBox
            type="success"
            label="Buy"
            year={report.bestModelYear.buy.year}
            reason={report.bestModelYear.buy.reason}
          />
          <YearBox
            type="warning"
            label="Engine Pick"
            year={report.bestModelYear.enginePick.year}
            reason={report.bestModelYear.enginePick.reason}
          />
          <YearBox
            type="error"
            label="Avoid"
            year={report.bestModelYear.avoid.year}
            reason={report.bestModelYear.avoid.reason}
          />
        </SectionCard>

        {/* 5. Running Costs */}
        <SectionCard title={`Running Costs (${report.currency})`}>
          <TableRow label="Annual Service" value={report.runningCosts.serviceCost} />
          <TableRow label="Fuel Economy" value={report.runningCosts.fuelEconomy} />
          <TableRow label="Insurance" value={report.runningCosts.insuranceGroup} />
          <TableRow label="Road Tax / Licence" value={report.runningCosts.roadTax} />
          <TableRow label="Tyres (full set)" value={report.runningCosts.tyreCost} last />
        </SectionCard>

        {/* 6. Finance */}
        <SectionCard title="Finance Analysis">
          <View style={styles.financeHeader}>
            <FinanceBadge verdict={report.financeAnalysis.verdict} size="lg" />
            <Text style={styles.priceRange}>{report.financeAnalysis.priceRange}</Text>
          </View>
          {report.financeAnalysis.reasoning.map((r, i) => (
            <Text key={i} style={styles.reasoning}>{r}</Text>
          ))}
          <HighlightBox type="warning" label="Hidden Cost Risk">
            <Text style={styles.hlText}>{report.financeAnalysis.hiddenCostRisk}</Text>
          </HighlightBox>
          <HighlightBox type="success" label="Recommendation">
            <Text style={styles.hlText}>{report.financeAnalysis.recommendation}</Text>
          </HighlightBox>
        </SectionCard>

        {/* 7. Competitors */}
        <SectionCard title="Competitor Comparison">
          <Text style={styles.overviewText}>{report.competitorComparison.overview}</Text>
          <View style={styles.prosConsRow}>
            <View style={styles.prosCol}>
              <Text style={[styles.prosConsHeader, { color: COLORS.success }]}>Pros</Text>
              {report.competitorComparison.pros.map((p, i) => (
                <Text key={i} style={styles.prosConsItem}>\u2713 {p}</Text>
              ))}
            </View>
            <View style={styles.consCol}>
              <Text style={[styles.prosConsHeader, { color: COLORS.error }]}>Cons</Text>
              {report.competitorComparison.cons.map((c, i) => (
                <Text key={i} style={styles.prosConsItem}>\u00d7 {c}</Text>
              ))}
            </View>
          </View>
          <Text style={styles.subLabel}>Head-to-Head</Text>
          {Object.entries(report.competitorComparison.headToHead).map(([c, note], i) => (
            <View key={i} style={styles.h2hRow}>
              <Text style={styles.h2hCar}>{c}</Text>
              <Text style={styles.h2hNote}>{note}</Text>
            </View>
          ))}
          <HighlightBox type="accent" label="Verdict">
            <Text style={styles.hlText}>{report.competitorComparison.verdict}</Text>
          </HighlightBox>
        </SectionCard>

        {/* 8. Final Verdict */}
        <SectionCard title="Final Verdict">
          <View style={styles.prosConsRow}>
            <View style={styles.prosCol}>
              <Text style={[styles.prosConsHeader, { color: COLORS.success }]}>Buy if...</Text>
              {report.finalVerdict.buyIf.map((b, i) => (
                <Text key={i} style={styles.prosConsItem}>\u2022 {b}</Text>
              ))}
            </View>
            <View style={styles.consCol}>
              <Text style={[styles.prosConsHeader, { color: COLORS.error }]}>Alternative if...</Text>
              {report.finalVerdict.considerAlternativeIf.map((a, i) => (
                <Text key={i} style={styles.prosConsItem}>\u2022 {a}</Text>
              ))}
            </View>
          </View>
          <View style={styles.bottomLine}>
            <Text style={styles.bottomLineLabel}>Bottom Line</Text>
            <Text style={styles.bottomLineText}>{report.finalVerdict.bottomLine}</Text>
          </View>
        </SectionCard>

        <Text style={styles.disclaimer}>
          For informational purposes only. Always verify with a qualified mechanic before purchase.
        </Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating PDF Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleExport}
        disabled={exporting}
        activeOpacity={0.85}
      >
        {exporting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.fabText}>\ud83d\udcc4 Export PDF</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ---- Sub-components ----

function Chip({ label }: { label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.text}>{label}</Text>
    </View>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: { fontSize: 12, color: COLORS.textSecondary },
});

function TableRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[trStyles.row, !last && trStyles.border]}>
      <Text style={trStyles.label}>{label}</Text>
      <Text style={trStyles.value}>{value}</Text>
    </View>
  );
}
const trStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  border: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { color: COLORS.textMuted, fontSize: 13, flex: 1 },
  value: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1.5, textAlign: 'right' },
});

type ColorType = 'success' | 'warning' | 'error';
function YearBox({ type, label, year, reason }: { type: ColorType; label: string; year: string; reason: string }) {
  const colors = {
    success: { text: COLORS.success, bg: COLORS.successBg, border: COLORS.successBorder },
    warning: { text: COLORS.warning, bg: COLORS.warningBg, border: COLORS.warningBorder },
    error: { text: COLORS.error, bg: COLORS.errorBg, border: COLORS.errorBorder },
  }[type];
  return (
    <View style={[ybStyles.box, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={ybStyles.row}>
        <Text style={[ybStyles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[ybStyles.year, { color: colors.text }]}>{year}</Text>
      </View>
      <Text style={ybStyles.reason}>{reason}</Text>
    </View>
  );
}
const ybStyles = StyleSheet.create({
  box: { borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: 8, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  year: { fontSize: 14, fontWeight: '700' },
  reason: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
});

type HLType = 'success' | 'warning' | 'error' | 'accent';
function HighlightBox({ type, label, children }: { type: HLType; label: string; children: React.ReactNode }) {
  const accent = { text: COLORS.accent, bg: `${COLORS.accent}12`, border: `${COLORS.accent}35` };
  const map = {
    success: { text: COLORS.success, bg: COLORS.successBg, border: COLORS.successBorder },
    warning: { text: COLORS.warning, bg: COLORS.warningBg, border: COLORS.warningBorder },
    error: { text: COLORS.error, bg: COLORS.errorBg, border: COLORS.errorBorder },
    accent,
  };
  const c = map[type];
  return (
    <View style={[hlStyles.box, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[hlStyles.label, { color: c.text }]}>{label}</Text>
      {children}
    </View>
  );
}
const hlStyles = StyleSheet.create({
  box: { borderRadius: RADIUS.md, padding: SPACING.md, marginTop: 10, borderWidth: 1 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
});

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
  topTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },

  scroll: { flex: 1 },
  content: { padding: SPACING.md },

  hero: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  heroSummary: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  financeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  priceRange: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  reasoning: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },

  overviewText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  prosConsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  prosCol: { flex: 1 },
  consCol: { flex: 1 },
  prosConsHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prosConsItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 17,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  h2hRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  h2hCar: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  h2hNote: { fontSize: 12, color: COLORS.textMuted },

  hlText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  bottomLine: {
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: 4,
  },
  bottomLineLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  bottomLineText: { fontSize: 14, color: COLORS.text, lineHeight: 21 },

  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 16,
  },

  fab: {
    position: 'absolute',
    bottom: 32,
    right: SPACING.lg,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: 22,
    paddingVertical: 14,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: { fontSize: 44, marginBottom: SPACING.md },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 21,
  },
  retryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
