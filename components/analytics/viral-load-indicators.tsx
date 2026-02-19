"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function ViralLoadIndicators() {
  const [data, setData] = useState<{ ageGroup: string; suppressedPct: number; dtgPct: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/viral-load${queryString}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setData((json.data ?? []).map((r: { ageGroup: string; suppressedPct: number; dtgPct: number }) => ({ ageGroup: r.ageGroup, suppressedPct: r.suppressedPct, dtgPct: r.dtgPct })))
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
        <CardDescription>VL suppression and DTG-based regimen coverage by age group (%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            suppressedPct: { label: "VL Suppressed %", color: "hsl(var(--chart-1))" },
            dtgPct: { label: "On DTG-based %", color: "hsl(var(--chart-2))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
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
                dataKey="suppressedPct"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                type="monotone"
                dataKey="dtgPct"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
