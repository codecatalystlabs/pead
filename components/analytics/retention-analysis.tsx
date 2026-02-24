"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { cohort: string; active: number; ltfu: number; dead: number; transferredOut: number; transferredIn: number }

export function RetentionAnalysis() {
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch("/api/analytics/capacity", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setData(json.retentionData ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No retention data</p></CardContent></Card>

  const chartData = data.map((r) => ({ ...r, transferred: r.transferredOut + r.transferredIn }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Retention Analysis</CardTitle>
        <CardDescription>Retention outcomes across cohorts (%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            active: { label: "Active", color: "hsl(var(--chart-1))" },
            ltfu: { label: "LTFU", color: "hsl(var(--chart-4))" },
            dead: { label: "Dead", color: "hsl(var(--chart-3))" },
            transferred: { label: "Transferred", color: "hsl(var(--chart-5))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="cohort" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="active" fill="hsl(var(--chart-1))" />
              <Bar dataKey="ltfu" fill="hsl(var(--chart-4))" />
              <Bar dataKey="dead" fill="hsl(var(--chart-3))" />
              <Bar dataKey="transferred" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
