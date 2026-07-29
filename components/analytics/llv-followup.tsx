"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Row = {
  ageGroup: string
  llv: number
  iac1: number
  iac2: number
  iac3: number
  iac4Plus: number
  repeatViralLoad: number
  suppressed: number
  stillLLVorHLV: number
}

/** Mirrors High-Level Viremia tabs for Low-Level Viremia. */
export function LLVFollowUp() {
  const { queryString, filters } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"iac" | "four-iac" | "outcomes">("iac")

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/llv${queryString}`, { credentials: "include", cache: "no-store" })
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
          <p className="text-sm text-muted-foreground">No Low-Level Viremia (LLV) and Intensive Adherence Counseling (IAC) data</p>
        </CardContent>
      </Card>
    )
  }

  const outcomeData = data.map((item) => ({
    ageGroup: item.ageGroup,
    repeatViralLoad: item.repeatViralLoad,
    suppressed: item.suppressed,
    stillLLVorHLV: item.stillLLVorHLV,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low-Level Viremia (LLV) and Intensive Adherence Counseling (IAC) Cascade</CardTitle>
        <CardDescription>
          Low-Level Viremia (200–999 copies/mL) with Intensive Adherence Counseling progression, repeat viral load testing, and six-month outcomes by age group — mirrored to the High-Level Viremia layout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="iac">Intensive Adherence Counseling (IAC) Cascade</TabsTrigger>
            <TabsTrigger value="four-iac">4 Intensive Adherence Counseling sessions and more</TabsTrigger>
            <TabsTrigger value="outcomes">Six-month outcomes</TabsTrigger>
          </TabsList>
          <TabsContent value="iac">
            <ChartContainer
              key={`iac-${tab}`}
              config={{
                llv: { label: "Total Low-Level Viremia", color: "hsl(var(--chart-1))" },
                iac1: { label: "1st Intensive Adherence Counseling", color: "hsl(var(--chart-2))" },
                iac2: { label: "2nd Intensive Adherence Counseling", color: "hsl(var(--chart-3))" },
                iac3: { label: "3rd Intensive Adherence Counseling", color: "hsl(var(--chart-4))" },
                iac4Plus: { label: "4 Intensive Adherence Counseling and more", color: "hsl(var(--chart-5))" },
              }}
              className="h-[250px]"
            >
              <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="llv" fill="hsl(var(--chart-1))" name="Low-Level Viremia" />
                  <Bar dataKey="iac1" fill="hsl(var(--chart-2))" name="1st IAC" />
                  <Bar dataKey="iac2" fill="hsl(var(--chart-3))" name="2nd IAC" />
                  <Bar dataKey="iac3" fill="hsl(var(--chart-4))" name="3rd IAC" />
                  <Bar dataKey="iac4Plus" fill="hsl(var(--chart-5))" name="4+ IAC" />
                </BarChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="four-iac">
            <ChartContainer
              key={`four-iac-${tab}`}
              config={{
                repeatViralLoad: { label: "Repeat Viral Load Test", color: "hsl(var(--chart-1))" },
                suppressed: { label: "Suppressed (≤200)", color: "hsl(var(--chart-3))" },
                stillLLVorHLV: { label: "Still Low-Level or High-Level Viremia", color: "hsl(var(--chart-4))" },
              }}
              className="h-[250px]"
            >
              <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="repeatViralLoad" fill="hsl(var(--chart-1))" name="Repeat viral load" />
                  <Bar dataKey="suppressed" fill="hsl(var(--chart-3))" name="Suppressed (≤200)" />
                  <Bar dataKey="stillLLVorHLV" fill="hsl(var(--chart-4))" name="Still LLV/HLV" />
                </BarChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="outcomes">
            <ChartContainer
              key={`outcomes-${tab}`}
              config={{
                suppressed: { label: "Suppressed", color: "hsl(var(--chart-3))" },
                stillLLVorHLV: { label: "Still Low-Level or High-Level Viremia", color: "hsl(var(--chart-4))" },
                repeatViralLoad: { label: "Repeat Viral Load Test", color: "hsl(var(--chart-1))" },
              }}
              className="h-[250px]"
            >
              <BarChart data={outcomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="repeatViralLoad" fill="hsl(var(--chart-1))" name="Repeat viral load" />
                  <Bar dataKey="suppressed" fill="hsl(var(--chart-3))" name="Suppressed" />
                  <Bar dataKey="stillLLVorHLV" fill="hsl(var(--chart-4))" name="Still LLV/HLV" />
                </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <h4 className="font-semibold mb-1">Suppressed (n / % of Low-Level Viremia)</h4>
            <div className="space-y-1">
              {data.map((item) => {
                const pct = item.llv > 0 ? ((item.suppressed / item.llv) * 100).toFixed(1) : "0.0"
                return (
                  <div key={item.ageGroup} className="flex justify-between">
                    <span className="truncate">{item.ageGroup}</span>
                    <span className="font-medium text-green-600 ml-1">
                      {filters.metricView === "absolute" ? item.suppressed : `${item.suppressed} (${pct}%)`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Still Low-Level or High-Level Viremia</h4>
            <div className="space-y-1">
              {data.map((item) => (
                <div key={item.ageGroup} className="flex justify-between">
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
