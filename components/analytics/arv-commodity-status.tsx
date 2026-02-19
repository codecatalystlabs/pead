"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { commodity: string; mos: number; optimal: number; status: string }

export function ARVCommodityStatus() {
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch("/api/analytics/commodities", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setData(json.data ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No commodity data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>ARV Commodity Availability</CardTitle>
        <CardDescription>Months of Stock (MOS) by formulation (optimal: 3 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            mos: { label: "Months of Stock", color: "hsl(var(--chart-1))" },
            optimal: { label: "Optimal Level", color: "hsl(var(--chart-4))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="commodity" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: "Months", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mos" fill="hsl(var(--chart-1))" />
              <Bar dataKey="optimal" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.commodity}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    item.status === "good"
                      ? "text-green-600"
                      : item.status === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {item.mos} MOS
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
