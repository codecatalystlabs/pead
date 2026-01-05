"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function RetentionAnalysis() {
  const data = [
    { cohort: "3-Month", active: 94, ltfu: 3, dead: 1, transferred: 2 },
    { cohort: "6-Month", active: 92, ltfu: 4, dead: 2, transferred: 2 },
    { cohort: "12-Month", active: 94, ltfu: 3, dead: 1, transferred: 2 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Retention Analysis</CardTitle>
        <CardDescription>Retention outcomes across cohorts (%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            active: { label: "Active", color: "hsl(var(--chart-1))" },
            ltfu: { label: "LTFU", color: "hsl(var(--chart-4))" },
            dead: { label: "Dead", color: "hsl(var(--chart-3))" },
            transferred: { label: "Transferred", color: "hsl(var(--chart-5))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="cohort" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="active" fill="hsl(var(--chart-1))" />
              <Bar dataKey="ltfu" fill="hsl(var(--chart-4))" />
              <Bar dataKey="dead" fill="hsl(var(--chart-3))" />
              <Bar dataKey="transferred" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
