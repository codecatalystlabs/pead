"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { SecTitle, SimCard, KpiCard, ChartBox, LegendRow, Note } from "./sim/primitives"
import { SIM } from "./sim/colors"

/**
 * Overview — Excel pead_dashboard_changes: 13 key areas.
 * Age/weight disaggregation for CALHIV only; pALD/MMD/DSD/VL shown combined (not age-split).
 */
export default function OverviewPageContent() {
  const { queryString } = useDashboardFilters()
  const [summary, setSummary] = useState<any>(null)
  const [age, setAge] = useState<{ label: string; n: number }[]>([])
  const [wt, setWt] = useState<{ label: string; n: number }[]>([])
  const [care, setCare] = useState<{ name: string; value: number }[]>([])
  const [vl, setVl] = useState<{ label: string; pct: number }[]>([])
  const [ahd, setAhd] = useState<{ group: string; population: number; cd4: number }[]>([])
  const [mmd, setMmd] = useState<{ label: string; n: number }[]>([])
  const [dsd, setDsd] = useState<{ label: string; n: number }[]>([])
  const [retention, setRetention] = useState<number | null>(null)
  const [ageMismatch, setAgeMismatch] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/api/analytics/summary${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/capacity${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/viral-load${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/ahd${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/dsd-mmd${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ]).then(([sum, pald, cap, viral, ahdJ, dsdJ]) => {
      if (!alive) return
      setSummary(sum)

      const ageRows = (pald?.ageBandData ?? []).map((r: any) => ({
        label: String(r.age).replace(" years", ""),
        n: r.inCare ?? 0,
      }))
      setAge(ageRows)
      const ageSum = ageRows.reduce((s: number, r: any) => s + r.n, 0)
      const total = pald?.totalCalhiv ?? sum?.totalCalhiv ?? 0
      if (total > 0 && ageSum > 0 && ageSum !== total) {
        setAgeMismatch(
          `Age bands sum to ${ageSum.toLocaleString()} but total in care is ${total.toLocaleString()}.`,
        )
      } else setAgeMismatch(null)

      setWt(
        (pald?.weightBandData ?? []).map((r: any) => ({
          label: r.band,
          n: (r.clhiv ?? 0) + (r.alhiv ?? 0),
        })),
      )

      const models = pald?.careModelData ?? []
      const accounted = models.reduce((s: number, m: any) => s + (m.patients ?? 0), 0)
      const shortfall = Math.max(0, total - accounted)
      setCare([
        ...models.map((m: any) => ({ name: m.name, value: m.patients ?? 0 })),
        ...(shortfall > 0 ? [{ name: "Not accounted for", value: shortfall }] : []),
      ])

      // Combined VL coverage & suppression (not age-disaggregated on overview)
      const updated = viral?.totalUpdated ?? (viral?.data ?? []).reduce((s: number, r: any) => s + (r.updated ?? 0), 0)
      const suppressed =
        viral?.totalSuppressed ?? (viral?.data ?? []).reduce((s: number, r: any) => s + (r.suppressed ?? 0), 0)
      const inCare = total || 1
      // Coverage = tested / in care; Suppression = suppressed / those with a result (approx updated as documented results when non-suppressed missing)
      const coveragePct = Math.round((updated / inCare) * 1000) / 10
      const suppressionPct = updated > 0 ? Math.round((suppressed / updated) * 1000) / 10 : 0
      setVl([
        { label: "Viral load coverage", pct: coveragePct },
        { label: "Viral load suppression", pct: suppressionPct },
      ])

      const byPop = ahdJ?.byPopulation
      if (byPop) {
        setAhd([
          {
            group: "Newly diagnosed",
            population: byPop.newlyDiagnosed?.identified ?? 0,
            cd4: byPop.newlyDiagnosed?.cd4Below200 ?? 0,
          },
          {
            group: "Not suppressed",
            population: byPop.unsuppressed?.identified ?? 0,
            cd4: byPop.unsuppressed?.cd4Below200 ?? 0,
          },
          {
            group: "Returned to care",
            population: byPop.reEngaged?.identified ?? 0,
            cd4: byPop.reEngaged?.cd4Below200 ?? 0,
          },
        ])
      }

      setMmd(
        (dsdJ?.mmdData ?? []).map((r: any) => ({
          label: r.period,
          n: r.number,
        })),
      )
      setDsd(
        (dsdJ?.dsdData ?? []).map((r: any) => ({
          label: r.code ?? r.model,
          n: r.number,
        })),
      )

      const rd = cap?.retentionData as { cohort: string; active: number }[] | undefined
      const expected = rd?.find((r) => /expected/i.test(r.cohort))?.active ?? 0
      const kept = rd?.find((r) => /kept/i.test(r.cohort))?.active ?? 0
      setRetention(expected > 0 ? Math.round((kept / expected) * 1000) / 10 : null)
    })
    return () => {
      alive = false
    }
  }, [queryString])

  const paldRate = summary?.paldTransitionRate ?? 0
  const paldTone = paldRate >= 70 ? "good" : paldRate >= 50 ? "warn" : undefined
  const retTone = retention != null && retention >= 85 ? "good" : retention != null && retention >= 70 ? "warn" : undefined
  const colors = [SIM.teal, SIM.gold, SIM.soft, SIM.red]

  return (
    <section>
      <SecTitle>Programme at a glance</SecTitle>
      <div className="sim-grid sim-g4">
        <KpiCard
          label="Children and adolescents living with HIV in care"
          value={(summary?.totalCalhiv ?? 0).toLocaleString()}
        />
        <KpiCard
          label="Transition to the paediatric formulation"
          value={`${paldRate.toFixed(0)}%`}
          footnote="on abacavir/lamivudine/dolutegravir 60/30/5 mg ÷ eligible (not all in care)"
          tone={paldTone}
        />
        <KpiCard
          label="Appointments kept"
          value={retention != null ? `${retention.toFixed(0)}%` : "—"}
          footnote="returned ÷ expected to return"
          tone={retTone}
        />
        <KpiCard
          label="Viral load suppression"
          value={`${(summary?.vlSuppressionRate ?? 0).toFixed(0)}%`}
          footnote="suppressed ÷ those with a documented result"
          tone={(summary?.vlSuppressionRate ?? 0) >= 85 ? "good" : "warn"}
        />
      </div>

      <div className="sim-grid sim-g2" style={{ marginTop: 14 }}>
        <SimCard
          title="Children and adolescents in care, by age band"
          desc="under 5, 5–9, 10–14, 15–19 — should add up to total in care"
        >
          {ageMismatch ? <Note warn>{ageMismatch}</Note> : null}
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={age} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="n" fill={SIM.teal} radius={[3, 3, 0, 0]} name="In care" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>

        <SimCard
          title="Children and adolescents in care, by weight band"
          desc="3–5.9 through 30 kg and above — form labels lighter bands as children and heavier as adolescents"
        >
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wt} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="n" fill={SIM.gold} radius={[3, 3, 0, 0]} name="In care" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          <Note>Chart shows all children and adolescents together by weight — not a children-only or adolescents-only key.</Note>
        </SimCard>
      </div>

      <div className="sim-grid sim-g2" style={{ marginTop: 14 }}>
        <SimCard title="Care model mix" desc="mixed outpatient, chronic care/clinic day, other ÷ total in care">
          <LegendRow
            items={care.map((c, i) => ({ color: colors[i % colors.length], label: c.name }))}
          />
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={care} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                  {care.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
          <Note>Models will not add to 100% — acute care has no count field. Shortfall shown as “not accounted for”.</Note>
        </SimCard>

        <SimCard
          title="Viral load coverage and suppression"
          desc="coverage = tested in last 6 months ÷ in care · suppression = suppressed ÷ documented result — combined, not by age"
        >
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vl} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={36} />
                <Bar dataKey="pct" fill={SIM.teal} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>
      </div>

      <div style={{ marginTop: 14 }}>
        <SimCard
          title="Advanced HIV disease: population and CD4 below 200"
          desc="three groups shown separately — newly diagnosed, not suppressed, returned to care (never added together)"
        >
          <LegendRow
            items={[
              { color: SIM.teal, label: "In population" },
              { color: SIM.red, label: "CD4 below 200" },
            ]}
          />
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ahd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="population" fill={SIM.teal} radius={[3, 3, 0, 0]} name="In population" />
                <Bar dataKey="cd4" fill={SIM.red} radius={[3, 3, 0, 0]} name="CD4 below 200" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>
      </div>

      <div className="sim-grid sim-g2" style={{ marginTop: 14 }}>
        <SimCard
          title="Multi-month dispensing"
          desc="3-month and 6-month combined — age split is on the dedicated tab"
        >
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mmd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="n" fill={SIM.gold} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>
        <SimCard
          title="Differentiated service delivery models"
          desc="combined across ages — model detail by age is on the dedicated tab"
        >
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dsd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="n" fill={SIM.teal} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>
      </div>
    </section>
  )
}
