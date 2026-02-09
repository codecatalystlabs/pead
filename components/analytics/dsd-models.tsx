"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function DSDModels() {
  const dsdData = [
    { model: "CDDP", number: 456, percentage: 16.0 },
    { model: "CCLAD", number: 623, percentage: 21.9 },
    { model: "CRPDDP", number: 234, percentage: 8.2 },
    { model: "FBIM", number: 892, percentage: 31.3 },
    { model: "FBG", number: 342, percentage: 12.0 },
    { model: "FTDR", number: 300, percentage: 10.5 },
  ]

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">DSD Models</CardTitle>
        <CardDescription className="text-xs">Distribution of CALHIV across DSD models</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            CDDP: { label: "CDDP", color: COLORS[0] },
            CCLAD: { label: "CCLAD", color: COLORS[1] },
            CRPDDP: { label: "CRPDDP", color: COLORS[2] },
            FBIM: { label: "FBIM", color: COLORS[3] },
            FBG: { label: "FBG", color: COLORS[4] },
            FTDR: { label: "FTDR", color: COLORS[5] },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dsdData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ model, percentage }) => `${model}: ${percentage}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="number"
              >
                {dsdData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 space-y-1">
          {dsdData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span>{item.model}</span>
              </div>
              <span className="font-semibold">
                {item.number.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

