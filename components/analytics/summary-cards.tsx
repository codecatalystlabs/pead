"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"

interface SummaryMetric {
  title: string
  value: string | number
  description: string
  tooltip?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function SummaryCards() {
  const { queryString } = useDashboardFilters()
  const [metrics, setMetrics] = useState<SummaryMetric[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/analytics/summary${queryString}`, { credentials: "include" })
        if (!res.ok) {
          throw new Error(`Failed to load summary (${res.status})`)
        }
        const data = await res.json()
        if (!isMounted) return

        const items: SummaryMetric[] = [
          {
            title: "Total CALHIV in Care",
            value: data.totalCalhiv?.toLocaleString?.() ?? data.totalCalhiv ?? "-",
            description: "Active patients across all facilities in your jurisdiction",
            tooltip: data.totalCalhiv != null ? `Total: ${Number(data.totalCalhiv).toLocaleString()} patients` : undefined,
          },
          {
            title: "Care Integration (pALD Eligible / Total CALHIV)",
            value: `${data.careIntegrationRate?.toFixed?.(1) ?? "0.0"}%`,
            description: "Proportion of CALHIV eligible for pALD",
            tooltip: data.paldEligible != null && data.totalCalhiv != null ? `Eligible: ${Number(data.paldEligible).toLocaleString()} / Total: ${Number(data.totalCalhiv).toLocaleString()} (${(data.careIntegrationRate ?? 0).toFixed(1)}%)` : undefined,
          },
          {
            title: "pALD Transition Rate",
            value: `${data.paldTransitionRate?.toFixed?.(1) ?? "0.0"}%`,
            description: "Eligible CALHIV who have transitioned to pALD",
            tooltip: data.paldOnPald != null && data.paldEligible != null ? `Transitioned: ${Number(data.paldOnPald).toLocaleString()} / Eligible: ${Number(data.paldEligible).toLocaleString()} (${(data.paldTransitionRate ?? 0).toFixed(1)}%)` : undefined,
          },
          {
            title: "Staff Training Coverage",
            value: `${data.staffTrainingCoverage?.toFixed?.(1) ?? "0.0"}%`,
            description: "Health workers trained in integration",
            tooltip: data.trainedHw != null && data.totalHw != null ? `Trained: ${Number(data.trainedHw).toLocaleString()} / Total: ${Number(data.totalHw).toLocaleString()} (${(data.staffTrainingCoverage ?? 0).toFixed(1)}%)` : undefined,
          },
          {
            title: "Viral Load Suppression",
            value: `${data.vlSuppressionRate?.toFixed?.(1) ?? "0.0"}%`,
            description: "Clients with a suppressed viral load among those with recent VL results",
            tooltip: data.vlSuppressed != null && data.totalVlEligible != null ? `Suppressed: ${Number(data.vlSuppressed).toLocaleString()} / Eligible: ${Number(data.totalVlEligible).toLocaleString()} (${(data.vlSuppressionRate ?? 0).toFixed(1)}%)` : undefined,
          },
        ]
        setMetrics(items)
      } catch (err: any) {
        if (!isMounted) return
        setError(err?.message ?? "Failed to load summary metrics")
      }
    })()

    return () => {
      isMounted = false
    }
  }, [queryString])

  if (error) {
    return <p className="text-xs text-red-600">{error}</p>
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-3">
              <CardTitle className="h-3 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-3 w-8 bg-muted rounded" />
              </div>
              <p className="mt-3 h-3 w-40 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div
                className={`text-3xl font-bold ${metric.tooltip ? "cursor-help" : ""}`}
                title={metric.tooltip}
              >
                {metric.value}
              </div>
              {metric.trend && (
                <div className={`text-sm font-semibold ${metric.trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {metric.trend.isPositive ? "↑" : "↓"} {metric.trend.value}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
