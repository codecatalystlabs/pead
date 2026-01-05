"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function TransitionTrends() {
  const data = [
    { month: "Jan", pALD: 45, nonPALD: 55 },
    { month: "Feb", pALD: 52, nonPALD: 48 },
    { month: "Mar", pALD: 58, nonPALD: 42 },
    { month: "Apr", pALD: 65, nonPALD: 35 },
    { month: "May", pALD: 70, nonPALD: 30 },
    { month: "Jun", pALD: 72, nonPALD: 28 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>pALD Transition Trends</CardTitle>
        <CardDescription>Percentage of CALHIV on pALD vs non-pALD formulations</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            pALD: { label: "pALD (ABC/3TC/DTG)", color: "hsl(var(--chart-1))" },
            nonPALD: { label: "Non-pALD", color: "hsl(var(--chart-4))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="pALD"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                type="monotone"
                dataKey="nonPALD"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-4))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
