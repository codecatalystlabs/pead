"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Narrative = {
  challenges: string[]
  innovations: string[]
  recommendations: string[]
  supportNeeded: string[]
  topicsCovered: Record<string, number>
}

/** Section D description / D.1.5B-style narrative visuals for integration. */
export function IntegrationNarrative() {
  const { queryString } = useDashboardFilters()
  const [data, setData] = useState<Narrative | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/capacity${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!alive) return
        setData(j.integrationNarrative ?? null)
      })
      .catch(() => alive && setData(null))
    return () => {
      alive = false
    }
  }, [queryString])

  if (!data) return null

  const topics = Object.entries(data.topicsCovered ?? {}).sort((a, b) => b[1] - a[1])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Model Implementation Notes</CardTitle>
        <CardDescription>
          Challenges, innovations, recommendations, and topics covered during capacity building (Section D / E)
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
        <NarrativeList title="Challenges" items={data.challenges} />
        <NarrativeList title="Innovations" items={data.innovations} />
        <NarrativeList title="Recommendations" items={data.recommendations} />
        <NarrativeList title="Areas needing support" items={data.supportNeeded} />
        {topics.length > 0 && (
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-2">Topics covered in mentorship / supervision</h4>
            <div className="flex flex-wrap gap-2">
              {topics.map(([topic, n]) => (
                <span key={topic} className="rounded-md bg-muted px-2 py-1 text-xs">
                  {topic.replace(/_/g, " ")} · {n} site{n === 1 ? "" : "s"}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NarrativeList({ title, items }: { title: string; items: string[] }) {
  const unique = [...new Set((items ?? []).map((s) => s.trim()).filter(Boolean))].slice(0, 8)
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      {unique.length === 0 ? (
        <p className="text-muted-foreground text-xs">No responses</p>
      ) : (
        <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
          {unique.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
