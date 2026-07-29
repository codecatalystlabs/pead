"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { SecTitle, SimCard, ChartBox, LegendRow, Note } from "./sim/primitives"
import { SIM } from "./sim/colors"

const DSD_COLORS = [SIM.teal, SIM.gold, SIM.red, SIM.soft, SIM.violet, SIM.aqua]

export function DsdMmdPageContent() {
  const { queryString } = useDashboardFilters()
  const [mmd, setMmd] = useState<{ age: string; mmd3: number; mmd6: number }[]>([])
  const [dsd, setDsd] = useState<{ model: string; code?: string; number: number }[]>([])

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/dsd-mmd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive) return
        setMmd(
          (j?.mmdByAgeBand ?? [])
            .filter((r: any) => r.age !== "0 - 4 years")
            .map((r: any) => ({
              age: String(r.age).replace(" years", ""),
              mmd3: r.mmd3,
              mmd6: r.mmd6,
            })),
        )
        setDsd(j?.dsdData ?? [])
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [queryString])

  return (
    <section>
      <SecTitle>Multi-month dispensing &amp; DSD models</SecTitle>
      <div className="sim-grid sim-g2">
        <SimCard title="Multi-month dispensing" desc="by age band 5–9, 10–14, 15–19">
          <LegendRow
            items={[
              { color: SIM.red, label: "3-month" },
              { color: SIM.teal, label: "6-month" },
            ]}
          />
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mmd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="age" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="mmd3" fill={SIM.red} radius={[3, 3, 0, 0]} name="3-month" />
                <Bar dataKey="mmd6" fill={SIM.teal} radius={[3, 3, 0, 0]} name="6-month" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          <Note>4–5 month band is not a separate field in the current ODK form — chart shows 3- and 6-month only.</Note>
        </SimCard>

        <SimCard title="DSD models — six categories (2024 framework)" desc="one primary model per child">
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dsd.map((d) => ({
                  label: d.code ?? d.model.split("(")[1]?.replace(")", "") ?? d.model,
                  n: d.number,
                }))}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={SIM.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SIM.mut }} axisLine={false} tickLine={false} width={40} />
                <Bar dataKey="n" radius={[3, 3, 0, 0]}>
                  {dsd.map((_, i) => (
                    <Cell key={i} fill={DSD_COLORS[i % DSD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          <Note>
            Models shown as reported in the tool (CDDP, CCLAD, CRPDDP, FBIM, FBG, FTDR). Approaches sit inside these as
            labels — never their own bars.
          </Note>
        </SimCard>
      </div>
    </section>
  )
}
