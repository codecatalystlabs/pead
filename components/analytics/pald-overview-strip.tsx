"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/** Compact pALD headline for Overview (no age/weight drill-down). */
export function PaldOverviewStrip() {
  const { queryString } = useDashboardFilters()
  const [ctx, setCtx] = useState<{ totalCalhiv: number; paldOnPald: number; paldEligible?: number } | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/summary${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!alive) return
        setCtx({
          totalCalhiv: j.totalCalhiv ?? 0,
          paldOnPald: j.paldOnPald ?? 0,
          paldEligible: j.paldEligible ?? 0,
        })
      })
      .catch(() => alive && setCtx(null))
    return () => {
      alive = false
    }
  }, [queryString])

  if (!ctx) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Loading pALD summary…</CardContent>
      </Card>
    )
  }

  const transitionPct =
    (ctx.paldEligible ?? 0) > 0 ? Math.min(100, (ctx.paldOnPald / (ctx.paldEligible ?? 1)) * 100) : 0
  const integrationPct = ctx.totalCalhiv > 0 ? Math.min(100, (ctx.paldOnPald / ctx.totalCalhiv) * 100) : 0

  return (
    <Card className="!bg-emerald-50/70 dark:!bg-emerald-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">pALD (Pediatric Optimized ARV Formulation)</CardTitle>
        <CardDescription>Headline transition only — age and weight detail is on the pALD tab</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">On pALD</div>
          <div className="text-xl font-bold">{ctx.paldOnPald.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Eligible for pALD</div>
          <div className="text-xl font-bold">{(ctx.paldEligible ?? 0).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Transition rate</div>
          <div className="text-xl font-bold">{transitionPct.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Share of total CALHIV</div>
          <div className="text-xl font-bold">{integrationPct.toFixed(1)}%</div>
        </div>
      </CardContent>
    </Card>
  )
}
