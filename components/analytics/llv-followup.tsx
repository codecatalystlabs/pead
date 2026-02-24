"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { ageGroup: string; llv: number; suppressed: number; stillLLVorHLV: number }

export function LLVFollowUp() {
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/llv${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setData(json.data ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No LLV follow-up data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low-Level Viremia (LLV) Follow-Up</CardTitle>
        <CardDescription>
          LLV (200-999 copies/mL) and IAC follow-up by age group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            llv: { label: "Total LLV", color: "hsl(var(--chart-1))" },
            suppressed: { label: "Suppressed", color: "hsl(var(--chart-3))" },
            stillLLVorHLV: { label: "Still LLV or HLV", color: "hsl(var(--chart-4))" },
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
              <Bar dataKey="llv" fill="hsl(var(--chart-1))" />
              <Bar dataKey="suppressed" fill="hsl(var(--chart-3))" />
              <Bar dataKey="stillLLVorHLV" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <h4 className="font-semibold mb-1">Suppressed (n / % of LLV)</h4>
            <div className="space-y-1">
              {data.map((item, idx) => {
                const pct = item.llv > 0 ? ((item.suppressed / item.llv) * 100).toFixed(1) : "0.0"
                return (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate">{item.ageGroup}</span>
                    <span className="font-medium text-green-600 ml-1">{item.suppressed} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Still LLV/HLV</h4>
            <div className="space-y-1">
              {data.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate">{item.ageGroup}</span>
                  <span className="font-medium ml-1">{item.stillLLVorHLV}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

