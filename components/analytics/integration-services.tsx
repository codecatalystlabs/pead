"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type IntegrationStats = {
  integratingYes: number
  integratingNo: number
  orientedYes: number
  services: Record<string, number>
}

export function IntegrationServices() {
  const { queryString } = useDashboardFilters()
  const [stats, setStats] = useState<IntegrationStats | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/capacity${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!alive) return
        setStats(j.integrationStatus ?? null)
      })
      .catch(() => alive && setStats(null))
    return () => {
      alive = false
    }
  }, [queryString])

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Loading integration status…</CardContent>
      </Card>
    )
  }

  const total = stats.integratingYes + stats.integratingNo
  const services = Object.entries(stats.services ?? {}).sort((a, b) => b[1] - a[1])

  return (
    <Card className="!bg-violet-50/50 dark:!bg-violet-950/20">
      <CardHeader>
        <CardTitle>Integration Status</CardTitle>
        <CardDescription>Health facilities integrating services, orientation, and services offered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Integrating services</div>
            <div className="text-lg font-bold">
              {stats.integratingYes}/{total} ({total ? Math.round((stats.integratingYes / total) * 100) : 0}%)
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Received orientation</div>
            <div className="text-lg font-bold">{stats.orientedYes}</div>
          </div>
        </div>
        {services.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1 text-xs">Services offered in integration</h4>
            <div className="flex flex-wrap gap-2">
              {services.map(([svc, n]) => (
                <span key={svc} className="rounded-md border px-2 py-1 text-xs">
                  {svc.replace(/_/g, " ")} · {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
