"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { ageGroup: string; screened: number; cd4: number; tb: number; malnutrition: number; crag: number | null }

export function AHDScreening() {
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch("/api/analytics/ahd", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setData(json.data ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No AHD screening data</p></CardContent></Card>

  const chartData = data.map((r) => ({ ...r, cd4Tested: r.cd4, tbScreened: r.tb, malScreened: r.malnutrition }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced HIV Disease (AHD) Screening</CardTitle>
        <CardDescription>CD4, TB, malnutrition by age; CRAG for 10+ years (numerator / denominator)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            cd4Tested: { label: "CD4", color: "hsl(var(--chart-1))" },
            tbScreened: { label: "TB", color: "hsl(var(--chart-2))" },
            malScreened: { label: "Malnutrition", color: "hsl(var(--chart-3))" },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="cd4Tested" fill="hsl(var(--chart-1))" />
              <Bar dataKey="tbScreened" fill="hsl(var(--chart-2))" />
              <Bar dataKey="malScreened" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <h4 className="font-semibold mb-1">Screened (n)</h4>
            {data.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate">{item.ageGroup}</span>
                <span className="font-medium ml-1">{item.screened}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-1">CRAG (10+ only)</h4>
            {data.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate">{item.ageGroup}</span>
                <span className="font-medium ml-1">{item.crag ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
