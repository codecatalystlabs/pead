"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PopMetrics = {
  identified: number
  cd4Below200: number
  malScreened: number
  malnourished: number
  malIntervention: number
  tbTested: number
  tbPositive: number
  tbTreatment: number
  cragScreened: number
  cragPositive: number
  cmTreatment: number
}

type Row = {
  ageGroup: string
  populations?: {
    newlyDiagnosed: PopMetrics
    unsuppressed: PopMetrics
    reEngaged: PopMetrics
  }
}

type PopKey = "newlyDiagnosed" | "unsuppressed" | "reEngaged"
type CascadeKey = "malnutrition" | "tb" | "meningitis"

export function AHDScreening() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pop, setPop] = useState<PopKey>("newlyDiagnosed")
  const [cascade, setCascade] = useState<CascadeKey>("malnutrition")

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/ahd${queryString}`, { credentials: "include", cache: "no-store" })
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
          <p className="text-sm text-muted-foreground">No Advanced HIV Disease (AHD) screening data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((r) => {
    const p = r.populations?.[pop] ?? {
      identified: 0,
      cd4Below200: 0,
      malScreened: 0,
      malnourished: 0,
      malIntervention: 0,
      tbTested: 0,
      tbPositive: 0,
      tbTreatment: 0,
      cragScreened: 0,
      cragPositive: 0,
      cmTreatment: 0,
    }
    if (cascade === "malnutrition") {
      return {
        ageGroup: r.ageGroup,
        a: p.malScreened,
        b: p.malnourished,
        c: p.malIntervention,
        d: p.cd4Below200,
      }
    }
    if (cascade === "tb") {
      return {
        ageGroup: r.ageGroup,
        a: p.tbTested || p.identified,
        b: p.tbPositive,
        c: p.tbTreatment,
        d: p.cd4Below200,
      }
    }
    return {
      ageGroup: r.ageGroup,
      a: p.cragScreened,
      b: p.cragPositive,
      c: p.cmTreatment,
      d: p.cd4Below200,
    }
  })

  const labels =
    cascade === "malnutrition"
      ? { a: "Screened for malnutrition", b: "Malnourished", c: "Receiving intervention", d: "CD4 below 200" }
      : cascade === "tb"
        ? { a: "Screened / tested for TB", b: "TB positive", c: "Started TB treatment", d: "CD4 below 200" }
        : { a: "Serum CRAG screened", b: "CRAG positive", c: "Started CM treatment", d: "CD4 below 200" }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced HIV Disease (AHD) Cascades</CardTitle>
        <CardDescription>
          Population tabs: newly diagnosed, unsuppressed, and re-engaged. Under each: malnutrition, tuberculosis (TB), and meningitis cascades by age band.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={pop} onValueChange={(v) => setPop(v as PopKey)}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="newlyDiagnosed">Newly diagnosed</TabsTrigger>
            <TabsTrigger value="unsuppressed">Unsuppressed</TabsTrigger>
            <TabsTrigger value="reEngaged">Re-engaged</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={cascade} onValueChange={(v) => setCascade(v as CascadeKey)}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="malnutrition">Malnutrition</TabsTrigger>
            <TabsTrigger value="tb">Tuberculosis (TB)</TabsTrigger>
            <TabsTrigger value="meningitis">Meningitis</TabsTrigger>
          </TabsList>
          <TabsContent value={cascade} className="mt-3">
            <ChartContainer
              key={`${pop}-${cascade}`}
              config={{
                a: { label: labels.a, color: "hsl(var(--chart-1))" },
                b: { label: labels.b, color: "hsl(var(--chart-2))" },
                c: { label: labels.c, color: "hsl(var(--chart-3))" },
                d: { label: labels.d, color: "hsl(var(--chart-4))" },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="a" name={labels.a} fill="hsl(var(--chart-1))" />
                  <Bar dataKey="b" name={labels.b} fill="hsl(var(--chart-2))" />
                  <Bar dataKey="c" name={labels.c} fill="hsl(var(--chart-3))" />
                  <Bar dataKey="d" name={labels.d} fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
