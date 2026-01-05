"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function ViralLoadIndicators() {
  const data = [
    { ageGroup: "< 3 months", suppressed: 85, dtu: 92 },
    { ageGroup: "3mo - 3yr", suppressed: 88, dtu: 95 },
    { ageGroup: "3 - 10 years", suppressed: 89, dtu: 94 },
    { ageGroup: "10 - 14 years", suppressed: 87, dtu: 93 },
    { ageGroup: "15 - 19 years", suppressed: 86, dtu: 91 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viral Load & DTG Coverage</CardTitle>
        <CardDescription>VL suppression and DTG-based regimen coverage by age group (%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            suppressed: { label: "VL Suppressed", color: "hsl(var(--chart-1))" },
            dtu: { label: "On DTG-based", color: "hsl(var(--chart-2))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[80, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="suppressed"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                type="monotone"
                dataKey="dtu"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
