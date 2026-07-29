"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { item: string; available: number; unavailable: number; category: string }

export function AhdCommodityAvailability() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/ahd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!alive) return
        setData(j.ahdCommodities ?? [])
      })
      .catch(() => alive && setData([]))
    return () => {
      alive = false
    }
  }, [queryString])

  if (!data.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability of Commodities for AHD Screening and Testing</CardTitle>
        <CardDescription>
          Sites reporting availability of laboratory and drug-related Advanced HIV Disease (AHD) commodities (Section G.5)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            available: { label: "Available (sites)", color: "hsl(var(--chart-1))" },
            unavailable: { label: "Unavailable (sites)", color: "hsl(var(--chart-4))" },
          }}
          className="h-[280px]"
        >
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="item" width={160} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="available" stackId="a" fill="hsl(var(--chart-1))" />
              <Bar dataKey="unavailable" stackId="a" fill="hsl(var(--chart-4))" />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
