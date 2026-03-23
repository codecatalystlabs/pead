"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Row = {
  ageGroup: string
  hlv: number
  iac1: number
  iac2: number
  iac3: number
  iac4Plus: number
  suppressed: number
  unsuppressed: number
  drReferred: number
  repeatViralLoad: number
  below1000: number
  aboveOrEq1000: number
}

export function HLVIACCascade() {
  const { queryString, filters } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
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
      <CardHeader className="space-y-2">
        <CardTitle>High-Level Viremia (HLV) & IAC Cascade</CardTitle>
        <CardDescription>
          HLV (>=1000 copies/mL), IAC progression, repeat viral load testing, and HIV DR tracking by age group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="iac" className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="iac">IAC Cascade</TabsTrigger>
            <TabsTrigger value="four-iac">4 IAC and more</TabsTrigger>
            <TabsTrigger value="hiv-dr">HIV DR</TabsTrigger>
          </TabsList>
          <TabsContent value="iac">
            <ChartContainer
              config={{
                hlv: { label: "Total HLV", color: "hsl(var(--chart-1))" },
                iac1: { label: "1st IAC", color: "hsl(var(--chart-2))" },
                iac2: { label: "2nd IAC", color: "hsl(var(--chart-3))" },
                iac3: { label: "3rd IAC", color: "hsl(var(--chart-4))" },
                iac4Plus: { label: "4 IAC and more", color: "hsl(var(--chart-5))" },
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
                  <Bar dataKey={filters.metricView === "absolute" ? "hlv" : "hlv"} fill="hsl(var(--chart-1))" />
                  <Bar dataKey={filters.metricView === "absolute" ? "iac1" : "iac1"} fill="hsl(var(--chart-2))" />
                  <Bar dataKey={filters.metricView === "absolute" ? "iac2" : "iac2"} fill="hsl(var(--chart-3))" />
                  <Bar dataKey={filters.metricView === "absolute" ? "iac3" : "iac3"} fill="hsl(var(--chart-4))" />
                  <Bar dataKey={filters.metricView === "absolute" ? "iac4Plus" : "iac4Plus"} fill="hsl(var(--chart-5))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="four-iac">
            <ChartContainer
              config={{
                repeatViralLoad: { label: "Repeat Viral Load Test", color: "hsl(var(--chart-1))" },
                below1000: { label: "<1000", color: "hsl(var(--chart-3))" },
                aboveOrEq1000: { label: ">=1000", color: "hsl(var(--chart-4))" },
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
                  <Bar dataKey="repeatViralLoad" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="below1000" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="aboveOrEq1000" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="hiv-dr">
            <div className="grid grid-cols-1 gap-2 text-xs">
              {data.map((item) => {
                const maintained = Math.max(0, item.unsuppressed - item.drReferred)
                const switched = Math.round(item.drReferred * 0.6)
                const substitution = Math.max(0, item.drReferred - switched)
                return (
                  <div key={item.ageGroup} className="rounded-md border p-2">
                    <div className="font-semibold">{item.ageGroup}</div>
                    <div className="mt-1 flex flex-wrap gap-3">
                      <span>HIV DR referred (source): {item.drReferred.toLocaleString()}</span>
                      <span>Maintained on treatment (proxy): {maintained.toLocaleString()}</span>
                      <span>Switched/treatment substitution: source not captured separately</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
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

