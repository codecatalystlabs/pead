"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"

type AgeRow = { age: string; mmd3: number; mmd6: number; total: number }
type PeriodRow = { period: string; number: number; percentage: number }

type Props = { overviewMode?: boolean }

export function MMDComponent({ overviewMode = false }: Props) {
  const { queryString, filters } = useDashboardFilters()
  const [byAge, setByAge] = useState<AgeRow[]>([])
  const [byPeriod, setByPeriod] = useState<PeriodRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/dsd-mmd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setByAge(json.mmdByAgeBand ?? [])
        setByPeriod(json.mmdData ?? [])
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
  if (!byAge.length && !byPeriod.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No Multi-Month Dispensing (MMD) data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = overviewMode
    ? byPeriod.map((r) => ({ label: r.period, mmd3: r.period.includes("3") ? r.number : 0, mmd6: r.period.includes("6") ? r.number : 0, total: r.number }))
    : byAge.map((r) => ({ label: r.age, mmd3: r.mmd3, mmd6: r.mmd6, total: r.total }))

  // For overview, show a single bar series of totals by period
  const overviewBars = overviewMode
    ? byPeriod.map((r) => ({ label: r.period, total: r.number }))
    : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Multi-Month Dispensing (MMD)</CardTitle>
        <CardDescription className="text-xs">
          {overviewMode
            ? "Patients on 3-month vs 6-month dispensing (not age-disaggregated)"
            : "Disaggregated by age band: 3-month vs 6-month Multi-Month Dispensing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            mmd3: { label: "3 months", color: "hsl(var(--chart-1))" },
            mmd6: { label: "6 months", color: "hsl(var(--chart-3))" },
            total: { label: "Patients", color: "hsl(var(--chart-1))" },
          }}
          className="h-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            {overviewMode && overviewBars ? (
              <BarChart data={overviewBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="hsl(var(--chart-1))" name="Patients" />
              </BarChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="mmd3" stackId="a" fill="hsl(var(--chart-1))" name="3 months" />
                <Bar dataKey="mmd6" stackId="a" fill="hsl(var(--chart-3))" name="6 months" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
        {!overviewMode && (
          <div className="mt-2 space-y-1">
            {byAge.map((item) => (
              <div key={item.age} className="flex items-center justify-between text-xs">
                <span>{item.age}</span>
                <span className="font-semibold">
                  {filters.metricView === "absolute"
                    ? `${item.total.toLocaleString()} (3m: ${item.mmd3}, 6m: ${item.mmd6})`
                    : `${item.total.toLocaleString()} total`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
