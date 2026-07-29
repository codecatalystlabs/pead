"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type PopMetrics = { identified: number; cd4Below200: number }

/** Overview AHD strip: screened / CD4 &lt; 200 by newly diagnosed, unsuppressed, re-engaged. */
export function AhdOverviewStrip() {
  const { queryString } = useDashboardFilters()
  const [byPop, setByPop] = useState<{
    newlyDiagnosed: PopMetrics
    unsuppressed: PopMetrics
    reEngaged: PopMetrics
  } | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/ahd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!alive) return
        if (j.byPopulation) {
          setByPop({
            newlyDiagnosed: {
              identified: j.byPopulation.newlyDiagnosed?.identified ?? 0,
              cd4Below200: j.byPopulation.newlyDiagnosed?.cd4Below200 ?? 0,
            },
            unsuppressed: {
              identified: j.byPopulation.unsuppressed?.identified ?? 0,
              cd4Below200: j.byPopulation.unsuppressed?.cd4Below200 ?? 0,
            },
            reEngaged: {
              identified: j.byPopulation.reEngaged?.identified ?? 0,
              cd4Below200: j.byPopulation.reEngaged?.cd4Below200 ?? 0,
            },
          })
          return
        }
        // Fallback: roll up age rows
        const empty = { identified: 0, cd4Below200: 0 }
        const roll = { newlyDiagnosed: { ...empty }, unsuppressed: { ...empty }, reEngaged: { ...empty } }
        for (const row of j.data ?? []) {
          for (const pop of ["newlyDiagnosed", "unsuppressed", "reEngaged"] as const) {
            const p = row.populations?.[pop]
            if (!p) continue
            roll[pop].identified += p.identified ?? 0
            roll[pop].cd4Below200 += p.cd4Below200 ?? 0
          }
        }
        setByPop(roll)
      })
      .catch(() => alive && setByPop(null))
    return () => {
      alive = false
    }
  }, [queryString])

  const chartData = byPop
    ? [
        {
          group: "Newly diagnosed",
          screened: byPop.newlyDiagnosed.identified,
          cd4Below200: byPop.newlyDiagnosed.cd4Below200,
        },
        {
          group: "Unsuppressed",
          screened: byPop.unsuppressed.identified,
          cd4Below200: byPop.unsuppressed.cd4Below200,
        },
        {
          group: "Re-engaged",
          screened: byPop.reEngaged.identified,
          cd4Below200: byPop.reEngaged.cd4Below200,
        },
      ]
    : []

  return (
    <Card className="!bg-amber-50/50 dark:!bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Advanced HIV Disease (AHD) — Overview</CardTitle>
        <CardDescription>
          Numbers screened and CD4 count below 200, by newly diagnosed, unsuppressed, and re-engaged
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!chartData.length ? (
          <p className="text-sm text-muted-foreground">No Advanced HIV Disease data</p>
        ) : (
          <ChartContainer
            config={{
              screened: { label: "Screened / identified", color: "hsl(var(--chart-1))" },
              cd4Below200: { label: "CD4 below 200", color: "hsl(var(--chart-4))" },
            }}
            className="h-[220px]"
          >
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="screened" fill="hsl(var(--chart-1))" name="Screened / identified" />
                <Bar dataKey="cd4Below200" fill="hsl(var(--chart-4))" name="CD4 below 200" />
              </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
