"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { SecTitle, SimCard, ChartBox, LegendRow, Note } from "./sim/primitives"
import { SIM } from "./sim/colors"

export function IntegrationPageContent() {
  const { queryString } = useDashboardFilters()
  const [care, setCare] = useState<{ name: string; patients: number; value: number }[]>([])
  const [services, setServices] = useState<{ name: string; pct: number }[]>([])
  const [cadre, setCadre] = useState<{ cadre: string; trained: number }[]>([])
  const [capBuild, setCapBuild] = useState<{ item: string; value: number }[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/analytics/capacity${queryString}`, { credentials: "include", cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ]).then(([pald, cap]) => {
      if (!alive) return
      const models = pald?.careModelData ?? []
      const totalCalhiv = pald?.totalCalhiv ?? 0
      const accounted = models.reduce((s: number, m: any) => s + (m.patients ?? 0), 0)
      const notAccounted = Math.max(0, totalCalhiv - accounted)
      setCare([
        ...models.map((m: any) => ({ name: m.name, patients: m.patients, value: m.patients })),
        ...(notAccounted > 0 ? [{ name: "Not accounted for", patients: notAccounted, value: notAccounted }] : []),
      ])
      const svc = cap?.integrationStatus?.services ?? {}
      const totalSites = (cap?.integrationStatus?.integratingYes ?? 0) + (cap?.integrationStatus?.integratingNo ?? 0) || 1
      setServices(
        Object.entries(svc).map(([name, n]) => ({
          name: name.replace(/_/g, " "),
          pct: Math.round((Number(n) / totalSites) * 1000) / 10,
        })),
      )
      setCadre(
        (cap?.data ?? [])
          .filter((r: any) => !/all cadres|pald/i.test(r.cadre))
          .map((r: any) => ({ cadre: r.cadre.replace(" officers", ""), trained: r.trained })),
      )
      setCapBuild(cap?.capacityBuilding ?? [])
    })
    return () => {
      alive = false
    }
  }, [queryString])

  const colors = [SIM.teal, SIM.gold, SIM.soft, SIM.red]

  return (
    <section>
      <SecTitle>Care models &amp; services</SecTitle>
      <div className="sim-grid sim-g2">
        <SimCard title="Children in each care model" desc="count + share of children in care">
          <LegendRow
            items={[
              { color: SIM.teal, label: "Chronic care" },
              { color: SIM.gold, label: "Mixed OPD" },
              { color: SIM.soft, label: "Other" },
              { color: SIM.red, label: "Not accounted for" },
            ]}
          />
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={care} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {care.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>

        <SimCard
          title='Facilities on vs off their preferred model'
          desc="preferred: HC II–IV → Mixed OPD · Hospitals / RRH / NRH / CoE → Chronic care"
        >
          <LegendRow
            items={[
              { color: SIM.good, label: "on preferred model" },
              { color: SIM.red, label: "off preferred model (flagged)" },
            ]}
          />
          <ChartBox>
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: SIM.mut,
                fontSize: 12,
                textAlign: "center",
                padding: 16,
              }}
            >
              Phase 2 indicator — requires facility level (A.1.1) linked to chosen model (D.1.5B)
            </div>
          </ChartBox>
          <Note warn>
            Concept only. Soft flag, not a fail. Suggested as a phase-2 indicator once model reporting is reliable.
          </Note>
        </SimCard>
      </div>

      <SecTitle>Services integrated &amp; capacity building</SecTitle>
      <div className="sim-grid sim-g2">
        <SimCard title="Services integrated" desc="share of facilities">
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={services.slice(0, 8)}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke={SIM.line} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 9, fill: SIM.mut }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="pct" fill={SIM.teal} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </SimCard>

        <SimCard title="Capacity building this quarter, by cadre" desc="people reached through supervision & mentorship, by cadre">
          <LegendRow
            items={[
              { color: SIM.teal, label: "trained / supervised" },
              { color: SIM.gold, label: "mentored" },
            ]}
          />
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cadre} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="cadre" tick={{ fontSize: 9, fill: SIM.mut }} angle={-25} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={36} />
                <Bar dataKey="trained" fill={SIM.teal} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          {capBuild.length > 0 ? (
            <Note>
              {capBuild.map((c) => `${c.item}: ${c.value.toLocaleString()}`).join(" · ")}
            </Note>
          ) : (
            <Note>Ongoing effort (a flow), so it stays meaningful each quarter.</Note>
          )}
        </SimCard>
      </div>
    </section>
  )
}
