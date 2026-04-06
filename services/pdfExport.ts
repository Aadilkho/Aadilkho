import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { CarReport } from '../types/report';

function severityColor(severity: string): string {
  switch (severity) {
    case 'Critical': return '#EF4444';
    case 'High': return '#F97316';
    case 'Medium': return '#F59E0B';
    default: return '#22C55E';
  }
}

function scoreColor(score: number): string {
  if (score >= 7.5) return '#22C55E';
  if (score >= 5.5) return '#F59E0B';
  return '#EF4444';
}

function verdictColor(verdict: string): string {
  switch (verdict) {
    case 'Recommend': return '#22C55E';
    case 'Caution': return '#F59E0B';
    default: return '#EF4444';
  }
}

function scoreBar(score: number): string {
  const pct = Math.round(score * 10);
  const color = scoreColor(score);
  return `<table style="width:100%;border-collapse:collapse"><tr>
    <td style="width:${pct}%;background:${color};height:8px;border-radius:4px"></td>
    <td style="width:${100 - pct}%;background:#E5E7EB;height:8px;border-radius:4px"></td>
  </tr></table>`;
}

export function buildReportHTML(report: CarReport): string {
  const date = new Date(report.generatedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const scoresHTML = Object.entries(report.reliabilityScores)
    .map(([key, val]) => `
      <tr>
        <td style="padding:8px 0;font-weight:600;text-transform:capitalize;width:150px;color:#374151">${key}</td>
        <td style="padding:8px 0">${scoreBar(val as number)}</td>
        <td style="padding:8px 0;text-align:right;font-weight:700;color:${scoreColor(val as number)};width:60px">${(val as number).toFixed(1)}/10</td>
      </tr>`)
    .join('');

  const issuesHTML = report.knownIssues
    .map((i) => `
      <div style="border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-bottom:12px;border-left:4px solid ${severityColor(i.severity)}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <strong style="font-size:15px;color:#111827">${i.name}</strong>
          <span style="background:${severityColor(i.severity)};color:white;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700">${i.severity}</span>
        </div>
        <p style="margin:0 0 6px;color:#9CA3AF;font-size:12px">${i.frequency} &bull; Est. repair: <strong>${i.repairCost}</strong></p>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.5">${i.description}</p>
        <p style="margin:0;font-size:12px;color:#6B7280">Affects: ${i.affectedVariants}</p>
      </div>`)
    .join('');

  const prosHTML = report.competitorComparison.pros.map((p) => `<li style="margin-bottom:6px;color:#374151">${p}</li>`).join('');
  const consHTML = report.competitorComparison.cons.map((c) => `<li style="margin-bottom:6px;color:#374151">${c}</li>`).join('');
  const h2hHTML = Object.entries(report.competitorComparison.headToHead)
    .map(([car, note]) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827">${car}</td><td style="padding:10px 12px;border-bottom:1px solid #F3F4F6;color:#6B7280">${note}</td></tr>`)
    .join('');
  const buyIfHTML = report.finalVerdict.buyIf.map((b) => `<li style="margin-bottom:8px;color:#374151">${b}</li>`).join('');
  const altIfHTML = report.finalVerdict.considerAlternativeIf.map((a) => `<li style="margin-bottom:8px;color:#374151">${a}</li>`).join('');
  const reasoningHTML = report.financeAnalysis.reasoning.map((r) => `<p style="margin:0 0 8px;color:#374151;line-height:1.6">${r}</p>`).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111827; padding: 40px; max-width: 820px; margin: 0 auto; font-size: 14px; line-height: 1.6; background: #fff; }
  h2 { font-size: 17px; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px; margin: 32px 0 16px; color: #111827; }
  .header { background: linear-gradient(135deg, #0F172A, #1E3A5F); color: white; padding: 28px 32px; border-radius: 12px; margin-bottom: 32px; }
  .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
  .header p { color: #94A3B8; font-size: 13px; }
  .badge { display: inline-block; padding: 5px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; color: white; }
  .green-box { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin-bottom: 10px; }
  .amber-box { background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 16px; margin-bottom: 10px; }
  .red-box { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 16px; margin-bottom: 10px; }
  .blue-box { background: #EFF6FF; border: 1px solid #93C5FD; border-radius: 8px; padding: 16px; margin-bottom: 10px; }
  .dark-box { background: #0F172A; color: white; border-radius: 10px; padding: 20px 24px; margin-top: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #F9FAFB; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 13px; color: #374151; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 11px; text-align: center; }
  ul { padding-left: 20px; }
</style></head><body>
  <div class="header">
    <h1>${report.car}</h1>
    <p>${report.country} &bull; ${report.currency} &bull; Generated ${date}</p>
  </div>

  <h2>Generation Overview</h2>
  <table><tr><th style="width:160px">Year Range</th><td style="padding:10px 12px">${report.generationOverview.yearRange}</td></tr>
  <tr><th>Phases / Facelifts</th><td style="padding:10px 12px">${report.generationOverview.phases.join(', ')}</td></tr>
  <tr><th>Engines Available</th><td style="padding:10px 12px">${report.generationOverview.engines.join(', ')}</td></tr></table>
  <p style="margin-top:12px;color:#374151;line-height:1.6">${report.generationOverview.summary}</p>

  <h2>Reliability Scores</h2>
  <table>${scoresHTML}</table>

  <h2>Known Issues</h2>
  ${issuesHTML}

  <h2>Best Model Year</h2>
  <div class="green-box"><strong style="color:#15803D">&#10003; Buy: ${report.bestModelYear.buy.year}</strong><br><span style="color:#374151">${report.bestModelYear.buy.reason}</span></div>
  <div class="amber-box"><strong style="color:#92400E">&#9881; Engine Pick: ${report.bestModelYear.enginePick.year}</strong><br><span style="color:#374151">${report.bestModelYear.enginePick.reason}</span></div>
  <div class="red-box"><strong style="color:#991B1B">&#10005; Avoid: ${report.bestModelYear.avoid.year}</strong><br><span style="color:#374151">${report.bestModelYear.avoid.reason}</span></div>

  <h2>Running Costs (${report.currency})</h2>
  <table>
    <tr><th>Annual Service</th><td style="padding:10px 12px">${report.runningCosts.serviceCost}</td></tr>
    <tr><th>Fuel Economy</th><td style="padding:10px 12px">${report.runningCosts.fuelEconomy}</td></tr>
    <tr><th>Insurance</th><td style="padding:10px 12px">${report.runningCosts.insuranceGroup}</td></tr>
    <tr><th>Road Tax / Licence</th><td style="padding:10px 12px">${report.runningCosts.roadTax}</td></tr>
    <tr><th>Tyres (full set)</th><td style="padding:10px 12px">${report.runningCosts.tyreCost}</td></tr>
  </table>

  <h2>Finance Analysis</h2>
  <p style="margin-bottom:12px"><span class="badge" style="background:${verdictColor(report.financeAnalysis.verdict)}">${report.financeAnalysis.verdict}</span> &nbsp; Price Range: <strong>${report.financeAnalysis.priceRange}</strong></p>
  ${reasoningHTML}
  <div class="amber-box" style="margin-top:12px"><strong style="color:#92400E">Hidden Cost Risk</strong><br><span style="color:#374151">${report.financeAnalysis.hiddenCostRisk}</span></div>
  <div class="green-box"><strong style="color:#15803D">Recommendation</strong><br><span style="color:#374151">${report.financeAnalysis.recommendation}</span></div>

  <h2>Competitor Comparison</h2>
  <p style="margin-bottom:14px;color:#374151">${report.competitorComparison.overview}</p>
  <div class="two-col">
    <div><strong style="color:#22C55E;font-size:13px">PROS</strong><ul style="margin-top:8px">${prosHTML}</ul></div>
    <div><strong style="color:#EF4444;font-size:13px">CONS</strong><ul style="margin-top:8px">${consHTML}</ul></div>
  </div>
  <table style="margin-bottom:12px"><tr><th>Competitor</th><th>vs ${report.car}</th></tr>${h2hHTML}</table>
  <div class="blue-box"><strong style="color:#1D4ED8">Verdict</strong><br><span style="color:#374151">${report.competitorComparison.verdict}</span></div>

  <h2>Final Verdict</h2>
  <div class="two-col">
    <div class="green-box"><strong style="color:#15803D">Buy the ${report.car} if...</strong><ul style="margin-top:10px">${buyIfHTML}</ul></div>
    <div class="red-box"><strong style="color:#991B1B">Consider alternative if...</strong><ul style="margin-top:10px">${altIfHTML}</ul></div>
  </div>
  <div class="dark-box">
    <div style="font-size:11px;font-weight:700;color:#60A5FA;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Bottom Line</div>
    <p style="color:#D1D5DB;line-height:1.6">${report.finalVerdict.bottomLine}</p>
  </div>

  <div class="footer">
    <p>CarIQ &bull; AI Car Research &amp; Buyer's Guide &bull; For informational purposes only. Always verify with a qualified mechanic before purchase.</p>
  </div>
</body></html>`;
}

export async function exportReportPDF(report: CarReport): Promise<void> {
  const html = buildReportHTML(report);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `CarIQ — ${report.car}`,
    UTI: 'com.adobe.pdf',
  });
}
