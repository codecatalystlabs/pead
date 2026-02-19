"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { NumDenomTooltipContent } from "./num-denom-tooltip"

type BandRow = { band: string; eligible: number; transitioned: number; pct: number }
type AgeRow = { age: string; eligible: number; transitioned: number; pct: number }

export function PALDTransitionDetails() {
  const [weightBandData, setWeightBandData] = useState<BandRow[]>([])
  const [ageBandData, setAgeBandData] = useState<AgeRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setWeightBandData(json.weightBandDataForTransition ?? [])
        setAgeBandData(json.ageBandData ?? [])
      })
      .catch((err) => isMounted && setError(err?.message ?? "Failed to load"))
    return () => { isMounted = false }
  }, [queryString])

  if (error) return <Card><CardContent className="pt-6"><p className="text-sm text-red-600">{error}</p></CardContent></Card>
  const hasData = weightBandData.length > 0 || ageBandData.length > 0
  if (!hasData) return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No pALD transition data</p></CardContent></Card>

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      {weightBandData.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>pALD Transition by Weight Band</CardTitle>
          <CardDescription>Eligible vs transitioned to pALD by weight band</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              eligible: { label: "Eligible", color: "hsl(var(--chart-1))" },
              transitioned: { label: "Transitioned", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightBandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="band" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <ChartTooltip
                content={
                  <NumDenomTooltipContent
                    getRows={(p) =>
                      [{
                        label: "Transitioned / Eligible",
                        numerator: Number(p.transitioned ?? 0),
                        denominator: Number(p.eligible ?? 0),
                        suffix: ` (${Number(p.pct ?? 0)}%)`,
                      }]
                    }
                    showDefaultBars={true}
                  />
                }
              />
                <Legend />
                <Bar dataKey="eligible" fill="hsl(var(--chart-1))" />
                <Bar dataKey="transitioned" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {weightBandData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{item.band}</span>
                <span
                  className="font-semibold text-green-600 cursor-help"
                  title={`Transitioned: ${item.transitioned.toLocaleString()} / Eligible: ${item.eligible.toLocaleString()} (${item.pct}%)`}
                >
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}
      {ageBandData.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>pALD Transition by Age Band</CardTitle>
          <CardDescription>Eligible vs transitioned to pALD by age group</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              eligible: { label: "Eligible", color: "hsl(var(--chart-1))" },
              transitioned: { label: "Transitioned", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageBandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <ChartTooltip
                content={
                  <NumDenomTooltipContent
                    getRows={(p) =>
                      [{
                        label: "Transitioned / Eligible",
                        numerator: Number(p.transitioned ?? 0),
                        denominator: Number(p.eligible ?? 0),
                        suffix: ` (${Number(p.pct ?? 0)}%)`,
                      }]
                    }
                    showDefaultBars={true}
                  />
                }
              />
                <Legend />
                <Bar dataKey="eligible" fill="hsl(var(--chart-1))" />
                <Bar dataKey="transitioned" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {ageBandData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{item.age}</span>
                <span
                  className="font-semibold text-green-600 cursor-help"
                  title={`Transitioned: ${item.transitioned.toLocaleString()} / Eligible: ${item.eligible.toLocaleString()} (${item.pct}%)`}
                >
                  {item.pct}%
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

