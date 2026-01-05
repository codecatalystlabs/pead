"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function ARVCommodityStatus() {
  const data = [
    { commodity: "pALD (60/30/5)", mos: 4.2, optimal: 3, status: "good" },
    { commodity: "ABC/3TC (120/60)", mos: 2.8, optimal: 3, status: "warning" },
    { commodity: "DTG 10mg", mos: 3.1, optimal: 3, status: "good" },
    { commodity: "AZT/3TC (60/30)", mos: 1.9, optimal: 3, status: "critical" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>ARV Commodity Availability</CardTitle>
        <CardDescription>Months of Stock (MOS) by formulation (optimal: 3 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            mos: { label: "Months of Stock", color: "hsl(var(--chart-1))" },
            optimal: { label: "Optimal Level", color: "hsl(var(--chart-4))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="commodity" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: "Months", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mos" fill="hsl(var(--chart-1))" />
              <Bar dataKey="optimal" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.commodity}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    item.status === "good"
                      ? "text-green-600"
                      : item.status === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {item.mos} MOS
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
