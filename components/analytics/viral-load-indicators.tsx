"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function ViralLoadIndicators() {
  const { queryString, filters } = useDashboardFilters()
  const [data, setData] = useState<{ ageGroup: string; suppressedPct: number; dtgPct: number; suppressed: number; updated: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/viral-load${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setData((json.data ?? []).map((r: { ageGroup: string; suppressedPct: number; dtgPct: number; suppressed: number; updated: number }) => ({ ageGroup: r.ageGroup, suppressedPct: r.suppressedPct, dtgPct: r.dtgPct, suppressed: r.suppressed, updated: r.updated })))
      })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No viral load data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viral Load Coverage and Suppression</CardTitle>
        <CardDescription>How viral load suppression is improving across age bands, with DTG coverage context.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            suppressedPct: { label: filters.metricView === "absolute" ? "VL Suppressed (n)" : "VL Suppressed %", color: "hsl(var(--chart-1))" },
            dtgPct: { label: "On DTG-based regimen %", color: "hsl(var(--chart-2))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={filters.metricView === "absolute" ? undefined : [0, 100]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, _item, _index, row) => {
                      const r = row as { updated?: number; suppressed?: number }
                      if (name === "VL Suppressed %" && r?.updated) return `${r.suppressed ?? value} / ${r.updated} (${value}%)`
                      return `${value}%`
                    }}
                  />
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={filters.metricView === "absolute" ? "suppressed" : "suppressedPct"}
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              {filters.metricView === "percentage" && (
                <Line
                type="monotone"
                dataKey="dtgPct"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
