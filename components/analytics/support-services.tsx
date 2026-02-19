"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { service: string; enrolled: number; total: number }

export function SupportServices() {
  const [supportData, setSupportData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch("/api/analytics/dsd-mmd", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setSupportData(json.supportData ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [])

  if (error) return <Card><CardContent className="pt-6"><p className="text-xs text-red-600">{error}</p></CardContent></Card>
  if (!supportData.length) return <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">No support services data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Support Services Enrollment</CardTitle>
        <CardDescription className="text-xs">Enrollment in psychosocial and peer support services</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            enrolled: { label: "Enrolled", color: "hsl(var(--chart-1))" },
            total: { label: "Total Eligible", color: "hsl(var(--chart-2))" },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="enrolled" fill="hsl(var(--chart-1))" />
              <Bar dataKey="total" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 space-y-1">
          {supportData.map((item, idx) => {
            const pct = item.total > 0 ? ((item.enrolled / item.total) * 100).toFixed(1) : "0.0"
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate">{item.service}</span>
                <span className="font-semibold ml-1">
                  {item.enrolled} / {item.total} ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

