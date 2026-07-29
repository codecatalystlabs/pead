"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

/** Section B: CALHIV in care by age band (Overview). */
export function AgeBandDistribution() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<{ age: string; inCare: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((j) => {
        if (!alive) return
        setData((j.ageBandData ?? []).map((r: { age: string; inCare: number }) => ({ age: r.age, inCare: r.inCare })))
      })
      .catch((e) => alive && setError(e?.message ?? "Failed to load"))
    return () => {
      alive = false
    }
  }, [queryString])

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-red-600">{error}</CardContent>
      </Card>
    )
  }
  if (!data.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">No age-band data</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CALHIV Distribution by Age Band</CardTitle>
        <CardDescription>
          Children and Adolescents Living with HIV (CALHIV) receiving care, by age band (Section B)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ inCare: { label: "In care", color: "hsl(var(--chart-1))" } }}
          className="h-[240px]"
        >
          <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="inCare" fill="hsl(var(--chart-1))" name="In care" />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
