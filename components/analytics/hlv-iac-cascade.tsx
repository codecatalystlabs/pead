"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { ageGroup: string; hlv: number; iac3: number; iac4Plus: number; suppressed: number; unsuppressed: number; drReferred: number }

export function HLVIACCascade() {
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/hlv-iac${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setData(json.data ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No HLV & IAC data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>High-Level Viremia (HLV) & IAC Cascade</CardTitle>
        <CardDescription>
          HLV (≥1,000 copies/mL) and Intensive Adherence Counseling (IAC) cascade by age group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            hlv: { label: "Total HLV", color: "hsl(var(--chart-1))" },
            iac3Plus: { label: "≥3 IAC Sessions", color: "hsl(var(--chart-2))" },
            suppressed: { label: "Suppressed After IAC", color: "hsl(var(--chart-3))" },
            unsuppressed: { label: "Unsuppressed After IAC", color: "hsl(var(--chart-4))" },
            drReferred: { label: "DR Testing Referred", color: "hsl(var(--chart-5))" },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="hlv" fill="hsl(var(--chart-1))" />
              <Bar dataKey="iac3" fill="hsl(var(--chart-2))" />
              <Bar dataKey="iac4Plus" fill="hsl(var(--chart-2))" />
              <Bar dataKey="suppressed" fill="hsl(var(--chart-3))" />
              <Bar dataKey="unsuppressed" fill="hsl(var(--chart-4))" />
              <Bar dataKey="drReferred" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <h4 className="font-semibold mb-1">IAC ≥3 Sessions</h4>
            <div className="space-y-1">
              {data.map((item, idx) => {
                const iac3Plus = item.iac3 + item.iac4Plus
                const pct = ((iac3Plus / item.hlv) * 100).toFixed(1)
                return (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate">{item.ageGroup}</span>
                    <span className="font-medium ml-1">{iac3Plus} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Suppressed</h4>
            <div className="space-y-1">
              {data.map((item, idx) => {
                const iac3Plus = item.iac3 + item.iac4Plus
                const pct = iac3Plus > 0 ? ((item.suppressed / iac3Plus) * 100).toFixed(1) : "0.0"
                return (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate">{item.ageGroup}</span>
                    <span className="font-medium text-green-600 ml-1">{item.suppressed} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

