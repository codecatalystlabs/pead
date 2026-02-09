"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function MMDComponent() {
  const mmdData = [
    { period: "3 Months", number: 1245, percentage: 43.7 },
    { period: "6 Months", number: 892, percentage: 31.3 },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Multi-Month Dispensing (MMD)</CardTitle>
        <CardDescription className="text-xs">CALHIV receiving multi-month drug refills</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            number: { label: "Number of Patients", color: "hsl(var(--chart-1))" },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mmdData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="number" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 space-y-1">
          {mmdData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span>{item.period}</span>
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

