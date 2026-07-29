"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type BestPractices = {
  successes: string[]
  challenges: string[]
  gaps: string[]
  supportRequested: string[]
}

export function BestPracticesPanel() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<BestPractices | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/dsd-mmd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!alive) return
        setData(j.bestPractices ?? null)
      })
      .catch(() => alive && setData(null))
    return () => {
      alive = false
    }
  }, [queryString])

  if (!data) return null
  const hasAny =
    (data.successes?.length ?? 0) +
      (data.challenges?.length ?? 0) +
      (data.gaps?.length ?? 0) +
      (data.supportRequested?.length ?? 0) >
    0
  if (!hasAny) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Practices and Challenges</CardTitle>
        <CardDescription>Optional narrative from facilities (filterable with global filters)</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 text-xs">
        <List title="Successes" items={data.successes} />
        <List title="Challenges" items={data.challenges} />
        <List title="Gaps" items={data.gaps} />
        <List title="Support requested" items={data.supportRequested} />
      </CardContent>
    </Card>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  const unique = [...new Set((items ?? []).map((s) => s.trim()).filter(Boolean))].slice(0, 10)
  return (
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      {unique.length === 0 ? (
        <p className="text-muted-foreground">None reported</p>
      ) : (
        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
          {unique.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
