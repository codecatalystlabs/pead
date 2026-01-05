"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryMetric {
  title: string
  value: string | number
  description: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function SummaryCards() {
  const metrics: SummaryMetric[] = [
    {
      title: "Total CALHIV in Care",
      value: "2,847",
      description: "Active patients across all facilities",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Care Integration Rate",
      value: "85%",
      description: "Facilities implementing integrated services",
      trend: { value: 5, isPositive: true },
    },
    {
      title: "pALD Transition Rate",
      value: "72%",
      description: "Eligible patients transitioned to pALD",
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Staff Training Coverage",
      value: "91%",
      description: "Health workers trained in integration",
      trend: { value: 3, isPositive: true },
    },
    {
      title: "Viral Load Suppression",
      value: "88%",
      description: "Patients with VL < 1000 copies/mL",
      trend: { value: 2, isPositive: true },
    },
    {
      title: "12-Month Retention",
      value: "94%",
      description: "Patients retained at 12 months",
      trend: { value: 1, isPositive: true },
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{metric.value}</div>
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
