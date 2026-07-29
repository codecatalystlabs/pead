"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Props = { summaryMode?: boolean }

type Row = {
  ageGroup: string
  inCare: number
  updated: number
  suppressed: number
  coveragePct: number
  suppressedPct: number
}

export function ViralLoadIndicators({ summaryMode = false }: Props) {
  const { queryString, filters } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/viral-load${queryString}`, { credentials: "include", cache: "no-store" })
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
          <p className="text-sm text-muted-foreground">No viral load data</p>
        </CardContent>
      </Card>
    )
  }

  const absolute = summaryMode || filters.metricView === "absolute"

  return (
    <Card className={summaryMode ? "!bg-blue-50/50 dark:!bg-blue-950/20" : undefined}>
      <CardHeader>
        <CardTitle>Viral Load Coverage and Suppression</CardTitle>
        <CardDescription>
          {summaryMode
            ? "Updated viral load tests and suppressed results by age band"
            : absolute
              ? "Numerator: virally suppressed · Denominator: CALHIV with an updated viral load — by age band"
              : "Coverage % = updated viral load / in care · Suppression % = suppressed / updated viral load"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            updated: { label: "Updated viral load", color: "hsl(var(--chart-1))" },
            suppressed: { label: "Virally suppressed", color: "hsl(var(--chart-3))" },
            coveragePct: { label: "Coverage %", color: "hsl(var(--chart-1))" },
            suppressedPct: { label: "Suppression %", color: "hsl(var(--chart-3))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" angle={-20} textAnchor="end" height={60} />
              <YAxis domain={absolute ? undefined : [0, 100]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const r = (item?.payload ?? {}) as Partial<Row>
                      if (name === "Suppression %" || name === "suppressedPct") {
                        return `${r?.suppressed ?? 0} / ${r?.updated ?? 0} (${value}%)`
                      }
                      if (name === "Coverage %" || name === "coveragePct") {
                        return `${r?.updated ?? 0} / ${r?.inCare ?? 0} (${value}%)`
                      }
                      return String(value)
                    }}
                  />
                }
              />
              <Legend />
              {absolute ? (
                <>
                  <Bar dataKey="updated" name="Updated viral load" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="suppressed" name="Virally suppressed" fill="hsl(var(--chart-3))" />
                </>
              ) : (
                <>
                  <Bar dataKey="coveragePct" name="Coverage %" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="suppressedPct" name="Suppression %" fill="hsl(var(--chart-3))" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
