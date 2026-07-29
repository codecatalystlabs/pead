"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { SecTitle, SimCard, KpiCard, ChartBox, LegendRow, Note, ToggleGroup, Cascade } from "./sim/primitives"
import { SIM } from "./sim/colors"

const AGES = [
  { value: "0 - 4 years", label: "0-4" },
  { value: "5 - 9 years", label: "5-9" },
  { value: "10 - 14 years", label: "10-14" },
  { value: "15 - 19 years", label: "15-19" },
]

export function ViralLoadPageContent() {
  const { queryString } = useDashboardFilters()
  const [ageBand, setAgeBand] = useState("10 - 14 years")
  const [retention, setRetention] = useState({ expected: 0, kept: 0 })
  const [vl, setVl] = useState<{ ageGroup: string; coveragePct: number; suppressedPct: number }[]>([])
  const [hlv, setHlv] = useState<any[]>([])
  const [llv, setLlv] = useState<any[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/api/analytics/capacity${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/viral-load${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/hlv-iac${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/llv${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ]).then(([cap, viral, h, l]) => {
      if (!alive) return
      const rd = cap?.retentionData as { cohort: string; active: number }[] | undefined
      setRetention({
        expected: rd?.find((r) => /expected/i.test(r.cohort))?.active ?? 0,
        kept: rd?.find((r) => /kept/i.test(r.cohort))?.active ?? 0,
      })
      setVl(
        (viral?.data ?? []).map((r: any) => ({
          ageGroup: String(r.ageGroup).replace(" years", ""),
          coveragePct: r.coveragePct ?? 0,
          suppressedPct: r.suppressedPct ?? 0,
        })),
      )
      setHlv(h?.data ?? [])
      setLlv(l?.data ?? [])
    })
    return () => {
      alive = false
    }
  }, [queryString])

  const keptPct = retention.expected > 0 ? Math.round((retention.kept / retention.expected) * 1000) / 10 : 0
  const hRow = hlv.find((r) => r.ageGroup === ageBand) ?? hlv[0]
  const lRow = llv.find((r) => r.ageGroup === ageBand) ?? llv[0]

  const iacBars = useMemo(() => {
    if (!hRow) return []
    const zeroTwo = Math.max(0, (hRow.hlv ?? 0) - (hRow.iac3 ?? 0) - (hRow.iac4Plus ?? 0))
    // Approximate 0,1,2 from residual; show 0-2 combined as red buckets roughly
    return [
      { label: "0–2", n: zeroTwo, fill: SIM.red },
      { label: "3", n: hRow.iac3 ?? 0, fill: SIM.good },
      { label: "4+", n: hRow.iac4Plus ?? 0, fill: SIM.gold },
    ]
  }, [hRow])

  const hlvSteps = hRow
    ? [
        { label: "High-level viraemia", n: hRow.hlv ?? 0, color: SIM.tealD },
        { label: "Completed ≥3 IAC", n: (hRow.iac3 ?? 0) + (hRow.iac4Plus ?? 0), color: SIM.teal },
        { label: "Re-suppressed (good)", n: hRow.suppressed ?? 0, color: SIM.good },
        { label: "Still non-suppressed", n: hRow.unsuppressed ?? 0, color: SIM.red },
        { label: "Referred for HIV drug resistance testing", n: hRow.drReferred ?? 0, color: SIM.gold },
        {
          label: "Switched / optimised regimen",
          n: hRow.switchedTreatment ?? hRow.drSwitched ?? 0,
          color: SIM.violet,
        },
      ]
    : []

  const llvSteps = lRow
    ? [
        { label: "Low-level viraemia", n: lRow.llv ?? 0, color: SIM.tealD },
        { label: "Completed ≥3 IAC", n: (lRow.iac3 ?? 0) + (lRow.iac4Plus ?? 0), color: SIM.teal },
        { label: "Re-suppressed", n: lRow.suppressed ?? 0, color: SIM.good },
        {
          label: "Still low-level or progressed to high-level",
          n: lRow.stillLLVorHLV ?? 0,
          color: SIM.gold,
        },
      ]
    : []

  return (
    <section>
      <SecTitle>Retention</SecTitle>
      <div className="sim-grid sim-g3">
        <KpiCard label="Expected for review" value={retention.expected.toLocaleString()} />
        <KpiCard label="Returned" value={retention.kept.toLocaleString()} />
        <KpiCard
          label="Kept appointments"
          value={`${keptPct}%`}
          footnote="combined — not by age"
          tone={keptPct >= 85 ? "good" : keptPct >= 70 ? "warn" : undefined}
        />
      </div>

      <SecTitle>Viral load — by age band</SecTitle>
      <SimCard title="Coverage vs suppression" desc="bars, not a line — age bands are groups, not time">
        <LegendRow
          items={[
            { color: SIM.gold, label: "coverage" },
            { color: SIM.teal, label: "suppression" },
          ]}
        />
        <ChartBox>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vl} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={SIM.line} vertical={false} />
              <XAxis dataKey="ageGroup" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={36} />
              <Bar dataKey="coveragePct" fill={SIM.gold} radius={[3, 3, 0, 0]} />
              <Bar dataKey="suppressedPct" fill={SIM.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </SimCard>

      <SecTitle>High-level viraemia (≥1000) — IAC performance &amp; drug-resistance pathway</SecTitle>
      <SimCard title="IAC session distribution" desc="standard = 3 sessions in 3 months">
        <ToggleGroup
          label="Age band:"
          value={ageBand}
          options={AGES}
          onChange={setAgeBand}
        />
        <LegendRow
          items={[
            { color: SIM.red, label: "0–2 (not delivered)" },
            { color: SIM.good, label: "3 (on target)" },
            { color: SIM.gold, label: "4+ (review)" },
          ]}
        />
        <ChartBox>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={iacBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={SIM.line} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
              <Bar dataKey="n" radius={[3, 3, 0, 0]}>
                {iacBars.map((b) => (
                  <Cell key={b.label} fill={b.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
        <Note warn>
          0–2 sessions = firm flag (standard not delivered). 4+ = soft flag — may show an adherence or reach challenge.
        </Note>
      </SimCard>

      <div style={{ marginTop: 14 }}>
        <SimCard
          title="Full high-level viraemia pathway (with HIV drug resistance)"
          desc="the two-branch outcome after ≥3 IAC sessions"
        >
          {hlvSteps.length ? <Cascade steps={hlvSteps} /> : <Note>No HLV data for this age band</Note>}
        </SimCard>
      </div>

      <SecTitle>Low-level viraemia (200–999) — its own cascade (Section K)</SecTitle>
      <SimCard title="Full low-level viraemia pathway" desc="spelled out separately from high-level">
        {llvSteps.length ? <Cascade steps={llvSteps} /> : <Note>No LLV data for this age band</Note>}
        <Note warn>Section K is low-level — do not confuse with high-level column names.</Note>
      </SimCard>
    </section>
  )
}
