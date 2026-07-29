"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import {
  SecTitle,
  SimCard,
  KpiCard,
  ChartBox,
  LegendRow,
  Note,
  ToggleGroup,
  MiniTable,
} from "./sim/primitives"
import { SIM } from "./sim/colors"

export function PaldPageContent() {
  const { queryString } = useDashboardFilters()
  const [mode, setMode] = useState<"w" | "a">("w")
  const [pald, setPald] = useState<any>(null)
  const [commodities, setCommodities] = useState<any[]>([])
  const [regimen, setRegimen] = useState<{ line: string; number: number; availableSites?: number }[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/commodities${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ]).then(([p, c]) => {
      if (!alive) return
      setPald(p)
      setCommodities(c?.data ?? [])
      setRegimen(c?.regimenLines ?? [])
    })
    return () => {
      alive = false
    }
  }, [queryString])

  const on120 = pald?.cascade?.on1206010 ?? pald?.nonPaldTotal ?? 0
  const eligible = pald?.cascade?.eligible ?? pald?.dataQualitySummary?.paldEligibleByWeight ?? 0
  const onPald = pald?.cascade?.onPald ?? pald?.paldOnPald ?? 0
  const gap = Math.max(0, eligible - onPald)

  const twData = useMemo(() => {
    if (mode === "a") {
      return (pald?.ageBandData ?? []).map((r: any) => ({
        label: String(r.age).replace(" years", ""),
        on120: Math.max(0, (r.inCare ?? 0) - (r.onPald ?? 0)),
        eligible: r.eligible ?? 0,
        on60305: r.onPald ?? 0,
      }))
    }
    return (pald?.weightBandData ?? []).map((r: any) => ({
      label: r.band,
      on120: Math.max(0, (r.clhiv ?? 0) + (r.alhiv ?? 0) - (r.transitioned ?? 0)),
      eligible: r.eligible ?? 0,
      on60305: r.transitioned ?? 0,
    }))
  }, [mode, pald])

  const rateData = (pald?.weightBandDataForTransition ?? pald?.weightBandData ?? [])
    .filter((r: any) => (r.eligible ?? 0) > 0)
    .map((r: any) => ({
      label: r.band,
      pct: r.eligible > 0 ? Math.round((r.transitioned / r.eligible) * 1000) / 10 : 0,
    }))

  const trend = (pald?.transitionTrendsData ?? []).map((r: any) => ({
    label: r.month,
    pct: r.pALD,
  }))

  const totalInCare = pald?.totalCalhiv ?? 0
  const lineRows = regimen.map((r) => {
    const share = totalInCare > 0 ? Math.round((r.number / totalInCare) * 1000) / 10 : 0
    return [r.line, r.number.toLocaleString(), `${share}%`]
  })

  function stockStatus(days: number, avail: number): { text: string; className: string } {
    if (days >= 14 || avail < 50) return { text: "Stock-out", className: "bad" }
    if (days > 0 || avail < 80) return { text: "Understocked", className: "mid" }
    return { text: "Adequate", className: "ok" }
  }

  return (
    <section>
      <SecTitle>Paediatric formulation transition</SecTitle>
      <div className="sim-grid sim-g4">
        <KpiCard label="On 120/60/10 mg" value={on120.toLocaleString()} footnote="count" />
        <KpiCard label="Eligible for 60/30/5 mg" value={eligible.toLocaleString()} footnote="count" />
        <KpiCard label="On 60/30/5 mg" value={onPald.toLocaleString()} footnote="count" />
        <KpiCard label="Eligibility gap" value={gap.toLocaleString()} footnote="still to move" tone="warn" />
      </div>

      <div className="sim-grid sim-g2" style={{ marginTop: 14 }}>
        <SimCard title="Three-way transition" desc="on 120/60/10 vs eligible vs on 60/30/5">
          <ToggleGroup
            label="View by:"
            value={mode}
            options={[
              { value: "w", label: "Weight band" },
              { value: "a", label: "Age band" },
            ]}
            onChange={(v) => setMode(v as "w" | "a")}
          />
          <LegendRow
            items={[
              { color: SIM.blue, label: "on 120/60/10" },
              { color: SIM.gold, label: "eligible" },
              { color: SIM.aqua, label: "on 60/30/5" },
            ]}
          />
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={twData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="on120" fill={SIM.blue} radius={[2, 2, 0, 0]} />
                <Bar dataKey="eligible" fill={SIM.gold} radius={[2, 2, 0, 0]} />
                <Bar dataKey="on60305" fill={SIM.aqua} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          <Note>Non-eligible bands show only the &quot;on 120/60/10&quot; bar — correct, not missing data.</Note>
        </SimCard>

        <SimCard title="Transition rate (on 60/30/5 ÷ eligible)" desc="eligible bands only · %">
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={36} />
                <Bar dataKey="pct" fill={SIM.good} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          <Note>Denominator is eligible — never all children in care.</Note>
        </SimCard>
      </div>

      <div style={{ marginTop: 14 }}>
        <SimCard title="Transition trend over time" desc="rate onto 60/30/5 mg, by reporting quarter">
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={36} />
                <Line type="monotone" dataKey="pct" stroke={SIM.good} strokeWidth={2} dot={{ r: 4, fill: SIM.good }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>
      </div>

      <SecTitle>Treatment line</SecTitle>
      <div className="sim-grid sim-g2">
        <SimCard title="Children by treatment line" desc="1st line worked out by subtraction">
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={regimen.map((r) => ({ label: r.line, n: r.number }))}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke={SIM.line} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={80}
                  tick={{ fontSize: 10, fill: SIM.mut }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="n" fill={SIM.teal} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>
        <SimCard title="Share on each line">
          <MiniTable headers={["Line", "Count", "Share of in care"]} rows={lineRows.length ? lineRows : [["—", "0", "0%"]]} />
        </SimCard>
      </div>

      <SecTitle>Commodity availability</SecTitle>
      <SimCard title="Stock status by medicine" desc="status + days out of stock — NOT months of stock">
        <MiniTable
          headers={["Medicine", "Status", "Days out of stock"]}
          rows={
            commodities.length
              ? commodities.map((c) => {
                  const st = stockStatus(c.daysOfStockout ?? 0, c.availabilityPct ?? 0)
                  return [c.commodity, st, String(c.daysOfStockout ?? 0)]
                })
              : [["No commodity data", { text: "—", className: "mid" }, "—"]]
          }
        />
      </SimCard>
    </section>
  )
}
