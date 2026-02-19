"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function WeightBandDistribution() {
  const [data, setData] = useState<{ band: string; clhiv: number; alhiv: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setData(json.weightBandData ?? [])
      })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No weight band data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>CALHIV Distribution by Weight Band</CardTitle>
        <CardDescription>Number of CALHIV receiving care by weight band</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            clhiv: { label: "CLHIV", color: "hsl(var(--chart-1))" },
            alhiv: { label: "ALHIV", color: "hsl(var(--chart-2))" },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="band" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, _item, _index, row) => {
                    const r = row as { clhiv?: number; alhiv?: number }
                    const total = (r?.clhiv ?? 0) + (r?.alhiv ?? 0)
                    return `${Number(value).toLocaleString()} / ${total > 0 ? total.toLocaleString() : "—"} (${name})`
                  }}
                />
              }
            />
              <Bar dataKey="clhiv" fill="hsl(var(--chart-1))" />
              <Bar dataKey="alhiv" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <h4 className="font-semibold mb-1 text-xs">CLHIV</h4>
            <div className="space-y-0.5">
              {data
                .filter((item) => item.clhiv > 0)
                .map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="truncate">{item.band}</span>
                    <span className="font-medium ml-1">{item.clhiv}</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-xs">ALHIV</h4>
            <div className="space-y-0.5">
              {data
                .filter((item) => item.alhiv > 0)
                .map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="truncate">{item.band}</span>
                    <span className="font-medium ml-1">{item.alhiv}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

