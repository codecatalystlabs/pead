"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type CascadeRow = { stage: string; value: number }

/** 4-stage pALD transition cascade: in care → on 120/60/10 → eligible → on pALD */
export function PaldCascade() {
  const { queryString } = useDashboardFilters()
  const [rows, setRows] = useState<CascadeRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((j) => {
        if (!alive) return
        const inCare = j.totalCalhiv ?? 0
        const onNonPald = j.dataQualitySummary?.careModelPatients != null
          ? Math.max(0, inCare - (j.paldOnPald ?? 0))
          : (j.nonPaldTotal ?? 0)
        // Prefer explicit fields when API provides cascade
        const cascade = j.cascade ?? {
          inCare,
          on1206010: onNonPald,
          eligible: j.dataQualitySummary?.paldEligibleByWeight ?? 0,
          onPald: j.paldOnPald ?? 0,
        }
        setRows([
          { stage: "In care (CALHIV)", value: cascade.inCare ?? inCare },
          { stage: "On ABC/3TC/DTG 120/60/10", value: cascade.on1206010 ?? 0 },
          { stage: "Eligible for pALD", value: cascade.eligible ?? 0 },
          { stage: "On pALD", value: cascade.onPald ?? 0 },
        ])
      })
      .catch((e) => alive && setError(e?.message ?? "Failed to load"))
    return () => {
      alive = false
    }
  }, [queryString])

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-red-600">{error}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="!bg-sky-50/60 dark:!bg-sky-950/25">
      <CardHeader>
        <CardTitle>pALD Transition Cascade</CardTitle>
        <CardDescription>
          Four-stage cascade: Children and Adolescents Living with HIV (CALHIV) in care → on ABC/3TC/DTG 120/60/10 → eligible → on pALD
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">No cascade data</p>
        ) : (
          <ChartContainer
            config={{ value: { label: "Patients", color: "hsl(var(--chart-1))" } }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" interval={0} angle={-20} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="value" name="Patients" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
