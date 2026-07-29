"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { line: string; number: number; availableSites: number }

export function RegimenLineStatus() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/commodities${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((j) => {
        if (!alive) return
        setData(j.regimenLines ?? [])
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drug Regimen Lines</CardTitle>
        <CardDescription>Patients on first-, second-, and third-line regimens (where reported)</CardDescription>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <p className="text-sm text-muted-foreground">No regimen line data</p>
        ) : (
          <>
            <ChartContainer
              config={{ number: { label: "Patients", color: "hsl(var(--chart-2))" } }}
              className="h-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="line" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="number" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-3 space-y-1 text-xs">
              {data.map((r) => (
                <div key={r.line} className="flex justify-between">
                  <span>{r.line}</span>
                  <span className="font-medium">
                    {r.number.toLocaleString()} patients · {r.availableSites} sites reporting available regimens
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
