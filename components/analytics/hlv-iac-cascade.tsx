"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
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
  drSwitched?: number
  maintainedOnTreatment?: number
  switchedTreatment?: number
  repeatViralLoad: number
  below1000: number
  aboveOrEq1000: number
}

export function HLVIACCascade() {
  const { queryString, filters } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"iac" | "four-iac" | "hiv-dr">("iac")

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/hlv-iac${queryString}`, { credentials: "include", cache: "no-store" })
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
          <p className="text-sm text-muted-foreground">No High-Level Viremia (HLV) and Intensive Adherence Counseling (IAC) data</p>
        </CardContent>
      </Card>
    )
  }

  const hivDrData = data.map((item) => ({
    ageGroup: item.ageGroup,
    referred: item.drReferred,
    maintained: item.maintainedOnTreatment ?? Math.max(0, item.drReferred - (item.drSwitched ?? item.switchedTreatment ?? 0)),
    switched: item.switchedTreatment ?? item.drSwitched ?? 0,
  }))

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>High-Level Viremia (HLV) and Intensive Adherence Counseling (IAC) Cascade</CardTitle>
        <CardDescription>
          High-Level Viremia (≥1,000 copies/mL), Intensive Adherence Counseling progression, repeat viral load testing, and HIV Drug Resistance tracking by age group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="iac">Intensive Adherence Counseling (IAC) Cascade</TabsTrigger>
            <TabsTrigger value="four-iac">4 Intensive Adherence Counseling sessions and more</TabsTrigger>
            <TabsTrigger value="hiv-dr">HIV Drug Resistance</TabsTrigger>
          </TabsList>
          <TabsContent value="iac">
            <ChartContainer
              key={`iac-${tab}`}
              config={{
                hlv: { label: "Total High-Level Viremia", color: "hsl(var(--chart-1))" },
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
                  <Bar dataKey="hlv" fill="hsl(var(--chart-1))" name="High-Level Viremia" />
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
                below1000: { label: "Below 1,000 copies/mL", color: "hsl(var(--chart-3))" },
                aboveOrEq1000: { label: "1,000 copies/mL or above", color: "hsl(var(--chart-4))" },
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
                  <Bar dataKey="below1000" fill="hsl(var(--chart-3))" name="Below 1,000" />
                  <Bar dataKey="aboveOrEq1000" fill="hsl(var(--chart-4))" name="≥1,000" />
                </BarChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="hiv-dr">
            <ChartContainer
              key={`hiv-dr-${tab}`}
              config={{
                referred: { label: "Referred for HIV Drug Resistance testing", color: "hsl(var(--chart-1))" },
                maintained: { label: "Maintained on treatment", color: "hsl(var(--chart-3))" },
                switched: { label: "Switched regimen after HIV Drug Resistance testing", color: "hsl(var(--chart-4))" },
              }}
              className="h-[250px]"
            >
              <BarChart data={hivDrData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="referred" fill="hsl(var(--chart-1))" name="Referred for HIV Drug Resistance testing" />
                  <Bar dataKey="maintained" fill="hsl(var(--chart-3))" name="Maintained on treatment" />
                  <Bar dataKey="switched" fill="hsl(var(--chart-4))" name="Switched regimen" />
                </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <h4 className="font-semibold mb-1">Intensive Adherence Counseling ≥3 sessions</h4>
            <div className="space-y-1">
              {data.map((item) => {
                const iac3Plus = item.iac3 + item.iac4Plus
                const pct = item.hlv > 0 ? ((iac3Plus / item.hlv) * 100).toFixed(1) : "0.0"
                return (
                  <div key={item.ageGroup} className="flex justify-between">
                    <span className="truncate">{item.ageGroup}</span>
                    <span className="font-medium ml-1">
                      {filters.metricView === "absolute" ? iac3Plus : `${iac3Plus} (${pct}%)`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Suppressed after Intensive Adherence Counseling</h4>
            <div className="space-y-1">
              {data.map((item) => {
                const iac3Plus = item.iac3 + item.iac4Plus
                const pct = iac3Plus > 0 ? ((item.suppressed / iac3Plus) * 100).toFixed(1) : "0.0"
                return (
                  <div key={item.ageGroup} className="flex justify-between">
                    <span className="truncate">{item.ageGroup}</span>
                    <span className="font-medium text-green-600 ml-1">
                      {item.suppressed} ({pct}%)
                    </span>
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
