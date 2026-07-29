"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { NumDenomTooltipContent } from "./num-denom-tooltip"

type BandRow = { band: string; eligible: number; transitioned: number; pct: number }
type AgeRow = { age: string; inCare: number; onPald: number; pct: number }

export function PALDTransitionDetails() {
  const [weightBandData, setWeightBandData] = useState<BandRow[]>([])
  const [ageBandData, setAgeBandData] = useState<AgeRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setWeightBandData(json.weightBandDataForTransition ?? [])
        setAgeBandData(json.ageBandData ?? [])
      })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => {
      isMounted = false
    }
  }, [queryString])

  if (error) {
    return (
      <Card className="min-w-0 overflow-hidden">
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }
  const hasData = weightBandData.length > 0 || ageBandData.length > 0
  if (!hasData) {
    return (
      <Card className="min-w-0 overflow-hidden">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No pALD transition data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 min-w-0">
      {weightBandData.length > 0 && (
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Reported Eligibility vs on pALD by Weight Band</CardTitle>
            <CardDescription>
              Numerator: transitioned to pALD · Denominator: eligible for pALD (weight-band section)
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            <ChartContainer
              config={{
                eligible: { label: "Eligible", color: "hsl(var(--chart-1))" },
                transitioned: { label: "Transitioned", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <BarChart data={weightBandData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="band" angle={-35} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10 }} />
                <YAxis width={48} tick={{ fontSize: 11 }} />
                <ChartTooltip
                  content={
                    <NumDenomTooltipContent
                      getRows={(p) => [
                        {
                          label: "Transitioned / Eligible",
                          numerator: Number(p.transitioned ?? 0),
                          denominator: Number(p.eligible ?? 0),
                          suffix: ` (${Number(p.pct ?? 0)}%)`,
                        },
                      ]}
                      showDefaultBars={true}
                    />
                  }
                />
                <Legend />
                <Bar dataKey="eligible" fill="hsl(var(--chart-1))" name="Eligible" />
                <Bar dataKey="transitioned" fill="hsl(var(--chart-2))" name="Transitioned" />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {weightBandData.map((item) => (
                <div key={item.band} className="flex items-center justify-between text-sm gap-2">
                  <span className="truncate">{item.band}</span>
                  <span
                    className="font-semibold text-green-600 cursor-help shrink-0"
                    title={`Transitioned: ${item.transitioned.toLocaleString()} / Eligible: ${item.eligible.toLocaleString()} (${item.pct}%)`}
                  >
                    {item.transitioned.toLocaleString()} / {item.eligible.toLocaleString()} ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {ageBandData.length > 0 && (
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>CALHIV in Care vs on pALD by Age Band</CardTitle>
            <CardDescription>
              Numerator: on pALD · Denominator: Children and Adolescents Living with HIV (CALHIV) in care
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            <ChartContainer
              config={{
                inCare: { label: "In care", color: "hsl(var(--chart-1))" },
                onPald: { label: "On pALD", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <BarChart data={ageBandData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" angle={-20} textAnchor="end" height={60} interval={0} tick={{ fontSize: 10 }} />
                <YAxis width={48} tick={{ fontSize: 11 }} />
                <ChartTooltip
                  content={
                    <NumDenomTooltipContent
                      getRows={(p) => [
                        {
                          label: "On pALD / In care",
                          numerator: Number(p.onPald ?? 0),
                          denominator: Number(p.inCare ?? 0),
                          suffix: ` (${Number(p.pct ?? 0)}%)`,
                        },
                      ]}
                      showDefaultBars={true}
                    />
                  }
                />
                <Legend />
                <Bar dataKey="inCare" fill="hsl(var(--chart-1))" name="In care" />
                <Bar dataKey="onPald" fill="hsl(var(--chart-2))" name="On pALD" />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {ageBandData.map((item) => (
                <div key={item.age} className="flex items-center justify-between text-sm gap-2">
                  <span className="truncate">{item.age}</span>
                  <span
                    className="font-semibold text-green-600 cursor-help shrink-0"
                    title={`On pALD: ${item.onPald.toLocaleString()} / In care: ${item.inCare.toLocaleString()} (${item.pct}%)`}
                  >
                    {item.onPald.toLocaleString()} / {item.inCare.toLocaleString()} ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
