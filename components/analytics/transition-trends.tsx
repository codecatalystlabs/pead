"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function TransitionTrends() {
  const [data, setData] = useState<{ month: string; pALD: number; nonPALD: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setData(json.transitionTrendsData ?? [])
      })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No trend data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>pALD Transition Trends</CardTitle>
        <CardDescription>Percentage of CALHIV on pALD vs non-pALD formulations</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            pALD: { label: "pALD (ABC/3TC/DTG)", color: "hsl(var(--chart-1))" },
            nonPALD: { label: "Non-pALD", color: "hsl(var(--chart-4))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => {
                      const pct = Number(value)
                      return `pALD: ${pct}% · non-pALD: ${100 - pct}% (of period total)`
                    }}
                  />
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pALD"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                type="monotone"
                dataKey="nonPALD"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-4))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
