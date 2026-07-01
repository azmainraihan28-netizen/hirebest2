import { Document, Page, Text, View, StyleSheet, Svg, Rect } from '@react-pdf/renderer'
import type { Candidate } from './screenings'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1f36' },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#6b7280', marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 18, marginBottom: 8 },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  statBox: { flex: 1, borderWidth: 1, borderColor: '#e3e6f0', borderRadius: 6, padding: 8 },
  statLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: 700, marginTop: 2 },
  summaryBox: { borderWidth: 1, borderColor: '#e3e6f0', borderRadius: 6, padding: 10, backgroundColor: '#f6f7fb' },
  summaryText: { fontSize: 10, lineHeight: 1.5 },
  bucketRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 90 },
  bucketCol: { flex: 1, alignItems: 'center', gap: 4 },
  bucketLabel: { fontSize: 7, color: '#6b7280' },
  bucketValue: { fontSize: 8, fontWeight: 700 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#f0f1f5' },
  table: { marginTop: 4 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1a1f36', paddingBottom: 4, marginBottom: 2 },
  tableRow: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#f0f1f5' },
  th: { fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280' },
  td: { fontSize: 9 },
  colName: { width: '28%' },
  colScore: { width: '10%' },
  colVerdict: { width: '14%' },
  colExp: { width: '12%' },
  colSkills: { width: '36%' },
})

export type ReportStats = {
  total: number
  fit: number
  maybe: number
  skip: number
  avgScore: number
  fitRate: number
  scoreBuckets: number[]
  bucketLabels: string[]
  topSkills: [string, number][]
  topGaps: [string, number][]
}

function verdictColor(v: Candidate['verdict']) {
  if (v === 'Fit') return '#10b981'
  if (v === 'Maybe') return '#f59e0b'
  return '#94a3b8'
}

export function computeReportStats(candidates: Candidate[]): ReportStats {
  const total = candidates.length
  const fit = candidates.filter(c => c.verdict === 'Fit').length
  const maybe = candidates.filter(c => c.verdict === 'Maybe').length
  const skip = candidates.filter(c => c.verdict === 'Skip').length
  const avgScore = total ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / total) : 0
  const fitRate = total ? Math.round((fit / total) * 100) : 0

  const scoreBuckets = [0, 0, 0, 0, 0]
  for (const c of candidates) scoreBuckets[Math.min(4, Math.floor(c.score / 20))]++

  const skillFreq: Record<string, number> = {}
  for (const c of candidates) for (const s of c.skills ?? []) skillFreq[s] = (skillFreq[s] ?? 0) + 1
  const topSkills = Object.entries(skillFreq).sort((a, b) => b[1] - a[1]).slice(0, 8) as [string, number][]

  const gapsFreq: Record<string, number> = {}
  for (const c of candidates) for (const g of c.gaps ?? []) gapsFreq[g] = (gapsFreq[g] ?? 0) + 1
  const topGaps = Object.entries(gapsFreq).sort((a, b) => b[1] - a[1]).slice(0, 6) as [string, number][]

  return {
    total, fit, maybe, skip, avgScore, fitRate,
    scoreBuckets, bucketLabels: ['0–19', '20–39', '40–59', '60–79', '80–100'],
    topSkills, topGaps,
  }
}

export function ScreeningReportDocument({
  screeningName, generatedAt, stats, aiSummary, candidates,
}: {
  screeningName: string
  generatedAt: string
  stats: ReportStats
  aiSummary: string
  candidates: Candidate[]
}) {
  const maxBucket = Math.max(1, ...stats.scoreBuckets)
  const donutTotal = Math.max(1, stats.fit + stats.maybe + stats.skip)
  const barWidth = 300
  const fitW = (stats.fit / donutTotal) * barWidth
  const maybeW = (stats.maybe / donutTotal) * barWidth
  const skipW = (stats.skip / donutTotal) * barWidth

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{screeningName}</Text>
        <Text style={styles.subtitle}>Screening report · generated {generatedAt} · HireBest</Text>

        <View style={styles.statRow}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Total CVs</Text><Text style={styles.statValue}>{stats.total}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Fit rate</Text><Text style={styles.statValue}>{stats.fitRate}%</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Avg score</Text><Text style={styles.statValue}>{stats.avgScore}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Fit / Maybe / Skip</Text><Text style={styles.statValue}>{stats.fit} / {stats.maybe} / {stats.skip}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>AI insights</Text>
        <View style={styles.summaryBox}><Text style={styles.summaryText}>{aiSummary || 'No AI summary available.'}</Text></View>

        <Text style={styles.sectionTitle}>Score distribution</Text>
        <View style={styles.bucketRow}>
          {stats.scoreBuckets.map((n, i) => (
            <View key={i} style={styles.bucketCol}>
              <Text style={styles.bucketValue}>{n}</Text>
              <Svg width={28} height={Math.max(4, (n / maxBucket) * 60)} viewBox="0 0 28 60" style={{ marginTop: 'auto' }}>
                <Rect x={0} y={0} width={28} height={60} fill="#2f7bff" opacity={0.55 + i * 0.09} />
              </Svg>
              <Text style={styles.bucketLabel}>{stats.bucketLabels[i]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Verdict mix</Text>
        <View style={{ gap: 8 }}>
          <Svg width={barWidth} height={16} viewBox={`0 0 ${barWidth} 16`}>
            <Rect x={0} y={0} width={barWidth} height={16} fill="#e3e6f0" />
            <Rect x={0} y={0} width={fitW} height={16} fill="#10b981" />
            <Rect x={fitW} y={0} width={maybeW} height={16} fill="#f59e0b" />
            <Rect x={fitW + maybeW} y={0} width={skipW} height={16} fill="#94a3b8" />
          </Svg>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={{ fontSize: 9 }}>Fit: {stats.fit} ({donutTotal ? Math.round((stats.fit / donutTotal) * 100) : 0}%)</Text>
            <Text style={{ fontSize: 9 }}>Maybe: {stats.maybe} ({donutTotal ? Math.round((stats.maybe / donutTotal) * 100) : 0}%)</Text>
            <Text style={{ fontSize: 9 }}>Skip: {stats.skip} ({donutTotal ? Math.round((stats.skip / donutTotal) * 100) : 0}%)</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Top skills</Text>
            {stats.topSkills.length === 0 && <Text style={{ fontSize: 9, color: '#6b7280' }}>No data.</Text>}
            {stats.topSkills.map(([s, n]) => (
              <View key={s} style={styles.listRow}><Text style={{ fontSize: 9 }}>{s}</Text><Text style={{ fontSize: 9 }}>{n}</Text></View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Most common gaps</Text>
            {stats.topGaps.length === 0 && <Text style={{ fontSize: 9, color: '#6b7280' }}>No data.</Text>}
            {stats.topGaps.map(([g, n]) => (
              <View key={g} style={styles.listRow}><Text style={{ fontSize: 9 }}>{g}</Text><Text style={{ fontSize: 9 }}>{n}</Text></View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Candidates ({candidates.length})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colName]}>Name</Text>
            <Text style={[styles.th, styles.colScore]}>Score</Text>
            <Text style={[styles.th, styles.colVerdict]}>Verdict</Text>
            <Text style={[styles.th, styles.colExp]}>Exp.</Text>
            <Text style={[styles.th, styles.colSkills]}>Top skills</Text>
          </View>
          {candidates.map(c => (
            <View key={c.id} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, styles.colName]}>{c.name ?? c.file_name ?? 'Unknown'}</Text>
              <Text style={[styles.td, styles.colScore]}>{c.score}</Text>
              <Text style={[styles.td, styles.colVerdict, { color: verdictColor(c.verdict) }]}>{c.verdict}</Text>
              <Text style={[styles.td, styles.colExp]}>{c.experience_years ?? '—'}</Text>
              <Text style={[styles.td, styles.colSkills]}>{(c.skills ?? []).slice(0, 4).join(', ')}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
