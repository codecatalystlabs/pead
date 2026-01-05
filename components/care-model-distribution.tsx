"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function CareModelDistribution() {
  const data = [
    { name: "Mixed OPD", value: 42, patients: 1194 },
    { name: "Chronic Care/Clinic Day", value: 38, patients: 1078 },
    { name: "Other Models", value: 20, patients: 575 },
  ]

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Model Distribution</CardTitle>
        <CardDescription>Distribution of CALHIV across care models (% of facilities)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            mixed: { label: "Mixed OPD", color: "hsl(var(--chart-1))" },
            chronic: { label: "Chronic Care", color: "hsl(var(--chart-2))" },
            other: { label: "Other Models", color: "hsl(var(--chart-3))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}% of facilities`} />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold">{item.patients.toLocaleString()} patients</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
