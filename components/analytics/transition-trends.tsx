"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
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
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>pALD Transition Trends</CardTitle>
        <CardDescription>
          Share of patients on pALD versus non-pALD (ABC/3TC/DTG 120/60/10) by reporting quarter (Quarter 1–4)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            pALD: { label: "pALD (ABC/3TC/DTG)", color: "hsl(var(--chart-1))" },
            nonPALD: { label: "Non-pALD", color: "hsl(var(--chart-4))" },
          }}
          className="h-[300px]"
        >
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} width={40} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="pALD"
              name="pALD %"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))" }}
            />
            <Line
              type="monotone"
              dataKey="nonPALD"
              name="Non-pALD %"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-4))" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
