"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]
const FALLBACK = [
  { name: "Mixed OPD", value: 0, patients: 0 },
  { name: "Chronic Care/Clinic Day", value: 0, patients: 0 },
  { name: "Other Models", value: 0, patients: 0 },
]

export function CareModelDistribution() {
  const [data, setData] = useState<{ name: string; value: number; patients: number }[]>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((json) => {
        if (isMounted && Array.isArray(json.careModelData)) setData(json.careModelData)
      })
      .catch((e) => { if (isMounted) setError(e?.message ?? "Failed to load") })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardHeader><CardTitle>Care Model Distribution</CardTitle></CardHeader><CardContent><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (loading) return <Card><CardHeader><CardTitle>Care Model Distribution</CardTitle></CardHeader><CardContent><div className="h-[300px] animate-pulse bg-muted rounded" /></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Model Distribution</CardTitle>
        <CardDescription>Distribution of CALHIV across care models (numerator / denominator)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            mixed: { label: "Mixed OPD", color: "hsl(var(--chart-1))" },
            chronic: { label: "Chronic Care", color: "hsl(var(--chart-2))" },
            other: { label: "Other Models", color: "hsl(var(--chart-3))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const p = item?.payload as { name?: string; value?: number; patients?: number }
                      const denom = (data.reduce((a, r) => a + r.patients, 0)) || 1
                      return `${p?.patients?.toLocaleString() ?? value} / ${denom.toLocaleString()} (${value}%)`
                    }}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold">{item.patients.toLocaleString()} patients</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
