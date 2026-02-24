"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { period: string; number: number; percentage: number }

export function MMDComponent() {
  const [mmdData, setMmdData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch("/api/analytics/dsd-mmd", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setMmdData(json.mmdData ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!mmdData.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No MMD data</p></CardContent></Card>

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Multi-Month Dispensing (MMD)</CardTitle>
        <CardDescription className="text-xs">CALHIV receiving multi-month drug refills</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            number: { label: "Number of Patients", color: "hsl(var(--chart-1))" },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mmdData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="number" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 space-y-1">
          {mmdData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span>{item.period}</span>
              <span className="font-semibold">
                {item.number.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

