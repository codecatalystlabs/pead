"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"

type Row = { cadre: string; trained: number; total: number; pct: number }
type CapacityBuildingRow = { item: string; value: number }

export function CapacityMetrics() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [capacityBuilding, setCapacityBuilding] = useState<CapacityBuildingRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/capacity${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setData(json.data ?? [])
        setCapacityBuilding(json.capacityBuilding ?? [])
      })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No capacity data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Training Capacity</CardTitle>
        <CardDescription>Health workers trained in integration by cadre</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            trained: { label: "Trained", color: "hsl(var(--chart-1))" },
            total: { label: "Total Staff", color: "hsl(var(--chart-2))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cadre" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="trained" fill="hsl(var(--chart-1))" />
              <Bar dataKey="total" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      {capacityBuilding.length > 0 && (
        <CardContent className="pt-0">
          <div className="rounded-md border p-3 text-xs">
            <p className="font-semibold mb-2">Capacity Building</p>
            <div className="grid gap-1">
              {capacityBuilding.map((row) => (
                <div key={row.item} className="flex items-center justify-between">
                  <span>{row.item}</span>
                  <span className="font-semibold">{row.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
