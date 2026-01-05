"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function CapacityMetrics() {
  const data = [
    { cadre: "Doctors", trained: 28, total: 30 },
    { cadre: "Clinical Officers", trained: 45, total: 48 },
    { cadre: "Nurses", trained: 92, total: 105 },
    { cadre: "Midwives", trained: 34, total: 38 },
    { cadre: "Peer Supporters", trained: 18, total: 22 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Training Capacity</CardTitle>
        <CardDescription>Health workers trained in integration by cadre</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            trained: { label: "Trained", color: "hsl(var(--chart-1))" },
            total: { label: "Total Staff", color: "hsl(var(--chart-2))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cadre" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="trained" fill="hsl(var(--chart-1))" />
              <Bar dataKey="total" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
