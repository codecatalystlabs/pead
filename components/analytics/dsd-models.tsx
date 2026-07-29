"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"

type Row = { model: string; code?: string; number: number; percentage: number }

type Props = { overviewMode?: boolean }

export function DSDModels({ overviewMode = false }: Props) {
  const { queryString, filters } = useDashboardFilters()
  const [dsdData, setDsdData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/dsd-mmd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setDsdData(json.dsdData ?? [])
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
          <p className="text-xs text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }
  if (!dsdData.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">No Differentiated Service Delivery (DSD) data</p>
        </CardContent>
      </Card>
    )
  }

  const chartRows = dsdData.map((r) => ({
    ...r,
    short: r.code ?? r.model.split("(")[1]?.replace(")", "") ?? r.model,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Differentiated Service Delivery (DSD) Models</CardTitle>
        <CardDescription className="text-xs">
          {overviewMode
            ? "Distribution across the six DSD models in the reporting tool"
            : "Patients by DSD model (Community Drug Distribution Point, Community Client-Led ART Delivery, Community Retail Pharmacy Drug Distribution Point, Facility-Based Individual Management, Facility-Based Groups, Fast-Track Drug Refill)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ number: { label: "Patients", color: "hsl(var(--chart-2))" } }}
          className="h-[240px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="short" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const row = item?.payload as Row | undefined
                      return `${row?.model ?? ""}: ${value}`
                    }}
                  />
                }
              />
              <Bar dataKey="number" fill="hsl(var(--chart-2))" name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 space-y-1">
          {dsdData.map((item) => (
            <div key={item.model} className="flex items-center justify-between text-xs gap-2">
              <span className="truncate">{item.model}</span>
              <span className="font-semibold shrink-0">
                {filters.metricView === "absolute"
                  ? item.number.toLocaleString()
                  : `${item.number.toLocaleString()} (${item.percentage}%)`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
