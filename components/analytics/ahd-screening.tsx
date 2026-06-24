"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Cascade = { newlyDiagnosed?: number; unsuppressed?: number; reEngaged?: number; cd4Below200?: number; screened?: number; positive?: number; onTreatment?: number }
type Row = {
  ageGroup: string
  hivCascade?: Cascade
  tbCascade?: Cascade
  meningitisCascade?: Cascade
}

export function AHDScreening() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"hiv" | "tb" | "meningitis">("hiv")

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/ahd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => { if (!isMounted) return; setData(json.data ?? []) })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  if (!data.length) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No AHD screening data</p></CardContent></Card>

  const hivData = data.map((r) => ({
    ageGroup: r.ageGroup,
    newlyDiagnosed: r.hivCascade?.newlyDiagnosed ?? 0,
    unsuppressed: r.hivCascade?.unsuppressed ?? 0,
    reEngaged: r.hivCascade?.reEngaged ?? 0,
    cd4Below200: r.hivCascade?.cd4Below200 ?? 0,
  }))
  const tbData = data.map((r) => ({
    ageGroup: r.ageGroup,
    screened: r.tbCascade?.screened ?? 0,
    positive: r.tbCascade?.positive ?? 0,
    onTreatment: r.tbCascade?.onTreatment ?? 0,
  }))
  const meningitisData = data.map((r) => ({
    ageGroup: r.ageGroup,
    screened: r.meningitisCascade?.screened ?? 0,
    positive: r.meningitisCascade?.positive ?? 0,
    onTreatment: r.meningitisCascade?.onTreatment ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced HIV Disease (AHD) Screening</CardTitle>
        <CardDescription>HIV, TB, and meningitis cascades from Section G (newly diagnosed, unsuppressed, re-engaged)</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "hiv" | "tb" | "meningitis")}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="hiv">HIV Cascade</TabsTrigger>
            <TabsTrigger value="tb">TB Cascade</TabsTrigger>
            <TabsTrigger value="meningitis">Meningitis Cascade</TabsTrigger>
          </TabsList>
          <TabsContent value="hiv">
            <ChartContainer
              key={`hiv-${tab}`}
              config={{
                newlyDiagnosed: { label: "Newly diagnosed", color: "hsl(var(--chart-1))" },
                unsuppressed: { label: "Unsuppressed", color: "hsl(var(--chart-2))" },
                reEngaged: { label: "Re-engaged in care", color: "hsl(var(--chart-3))" },
                cd4Below200: { label: "CD4 &lt; 200", color: "hsl(var(--chart-4))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hivData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="newlyDiagnosed" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="unsuppressed" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="reEngaged" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="cd4Below200" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="tb">
            <ChartContainer
              key={`tb-${tab}`}
              config={{
                screened: { label: "Screened for TB", color: "hsl(var(--chart-1))" },
                positive: { label: "Tested positive", color: "hsl(var(--chart-2))" },
                onTreatment: { label: "Started treatment", color: "hsl(var(--chart-3))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tbData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="screened" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="positive" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="onTreatment" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="meningitis">
            <ChartContainer
              key={`meningitis-${tab}`}
              config={{
                screened: { label: "CRAG screened", color: "hsl(var(--chart-1))" },
                positive: { label: "CRAG positive", color: "hsl(var(--chart-2))" },
                onTreatment: { label: "CM treatment", color: "hsl(var(--chart-3))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={meningitisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="screened" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="positive" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="onTreatment" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
