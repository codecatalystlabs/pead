"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Row = { ageGroup: string; screened: number; cd4: number; tb: number; malnutrition: number; crag: number | null }

export function AHDScreening() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

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

  const chartData = data.map((r) => ({ ...r, cd4Tested: r.cd4, tbScreened: r.tb, malScreened: r.malnutrition }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced HIV Disease (AHD) Screening</CardTitle>
        <CardDescription>CD4, TB, malnutrition by age; CRAG for 10+ years (numerator / denominator)</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hiv">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="hiv">HIV Cascade</TabsTrigger>
            <TabsTrigger value="tb">TB Cascade</TabsTrigger>
            <TabsTrigger value="meningitis">Meningitis Cascade</TabsTrigger>
          </TabsList>
          <TabsContent value="hiv">
            <ChartContainer
              config={{
                screened: { label: "Newly diagnosed / screened", color: "hsl(var(--chart-1))" },
                cd4Tested: { label: "CD4 < 200 proxy", color: "hsl(var(--chart-2))" },
                malScreened: { label: "Re-engaged in care proxy", color: "hsl(var(--chart-3))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="screened" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="cd4Tested" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="malScreened" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="tb">
            <ChartContainer
              config={{
                screened: { label: "Screened for TB", color: "hsl(var(--chart-1))" },
                tbScreened: { label: "Tested positive/proxy", color: "hsl(var(--chart-2))" },
                malScreened: { label: "Started treatment/proxy", color: "hsl(var(--chart-3))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="screened" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="tbScreened" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="malScreened" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="meningitis">
            <ChartContainer
              config={{
                crag: { label: "Screened for meningitis (CRAG)", color: "hsl(var(--chart-1))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.map((row) => ({ ...row, crag: row.crag ?? 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="crag" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <h4 className="font-semibold mb-1">Screened (n)</h4>
            {data.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate">{item.ageGroup}</span>
                <span className="font-medium ml-1">{item.screened}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-1">CRAG (10+ only)</h4>
            {data.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate">{item.ageGroup}</span>
                <span className="font-medium ml-1">{item.crag ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
