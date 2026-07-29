"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"

type Row = {
  commodity: string
  daysOfStockout: number
  availabilityPct: number
  sitesWithStock: number
  sitesReporting: number
  status: string
}

export function ARVCommodityStatus() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/commodities${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setData(json.data ?? [])
      })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => {
      isMounted = false
    }
  }, [queryString])

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }
  if (!data.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No commodity data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Antiretroviral (ARV) Commodity Availability</CardTitle>
        <CardDescription>
          Availability status and average days of stock-out by formulation (not months of stock)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            daysOfStockout: { label: "Average days of stock-out", color: "hsl(var(--chart-4))" },
            availabilityPct: { label: "Sites with stock (%)", color: "hsl(var(--chart-1))" },
          }}
          className="h-[300px]"
        >
          <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="commodity" angle={-35} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="daysOfStockout" fill="hsl(var(--chart-4))" name="Avg days stock-out" />
              <Bar dataKey="availabilityPct" fill="hsl(var(--chart-1))" name="Sites with stock %" />
            </BarChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.commodity} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium truncate">{item.commodity}</span>
              <span
                className={`shrink-0 font-bold ${
                  item.status === "good" ? "text-green-600" : item.status === "warning" ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {item.daysOfStockout} days OOS · {item.availabilityPct}% in stock ({item.sitesWithStock}/{item.sitesReporting})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
