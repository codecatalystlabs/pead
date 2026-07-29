"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = {
  band: string
  clhiv: number
  alhiv: number
  eligible?: number
  transitioned?: number
}

type Props = { showEligibility?: boolean }

export function WeightBandDistribution({ showEligibility = false }: Props) {
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  const { queryString } = useDashboardFilters()
  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json) => {
        if (!isMounted) return
        setData(json.weightBandData ?? [])
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
          <p className="text-sm text-muted-foreground">No weight band data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showEligibility
            ? "Eligibility and Transition to pALD by Weight Band"
            : "CALHIV Distribution by Weight Band"}
        </CardTitle>
        <CardDescription>
          {showEligibility
            ? "Numerator: transitioned to pALD · Denominator: eligible for pALD — plus Children Living with HIV (CLHIV) and Adolescents Living with HIV (ALHIV) in care"
            : "Children Living with HIV (CLHIV, typically &lt;20 kg) and Adolescents Living with HIV (ALHIV, typically ≥20 kg) receiving care by weight band"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            clhiv: { label: "Children Living with HIV (CLHIV)", color: "hsl(var(--chart-1))" },
            alhiv: { label: "Adolescents Living with HIV (ALHIV)", color: "hsl(var(--chart-2))" },
            eligible: { label: "Eligible for pALD", color: "hsl(var(--chart-3))" },
            transitioned: { label: "On pALD", color: "hsl(var(--chart-4))" },
          }}
          className="h-[280px]"
        >
          <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="band" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const r = (item?.payload ?? {}) as Partial<Row>
                      const total = (r?.clhiv ?? 0) + (r?.alhiv ?? 0)
                      if (name === "eligible" || name === "Eligible for pALD") {
                        return `${Number(value).toLocaleString()} eligible`
                      }
                      if (name === "transitioned" || name === "On pALD") {
                        return `${Number(value).toLocaleString()} / ${r?.eligible ?? 0} eligible`
                      }
                      return `${Number(value).toLocaleString()} / ${total > 0 ? total.toLocaleString() : "—"} (${name})`
                    }}
                  />
                }
              />
              <Legend />
              <Bar dataKey="clhiv" fill="hsl(var(--chart-1))" name="CLHIV" stackId="care" />
              <Bar dataKey="alhiv" fill="hsl(var(--chart-2))" name="ALHIV" stackId="care" />
              {showEligibility && (
                <>
                  <Bar dataKey="eligible" fill="hsl(var(--chart-3))" name="Eligible" />
                  <Bar dataKey="transitioned" fill="hsl(var(--chart-4))" name="On pALD" />
                </>
              )}
            </BarChart>
        </ChartContainer>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <h4 className="font-semibold mb-1 text-xs">Children Living with HIV (CLHIV)</h4>
            <div className="space-y-0.5">
              {data
                .filter((item) => item.clhiv > 0)
                .map((item) => (
                  <div key={item.band} className="flex justify-between text-xs">
                    <span className="truncate">{item.band}</span>
                    <span className="font-medium ml-1">{item.clhiv.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-xs">Adolescents Living with HIV (ALHIV)</h4>
            <div className="space-y-0.5">
              {data
                .filter((item) => item.alhiv > 0)
                .map((item) => (
                  <div key={item.band} className="flex justify-between text-xs">
                    <span className="truncate">{item.band}</span>
                    <span className="font-medium ml-1">{item.alhiv.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
