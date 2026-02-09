"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function SupportServices() {
  const supportData = [
    { service: "Psychosocial Support", enrolled: 156, total: 223 },
    { service: "Peer Support/Teen Club", enrolled: 289, total: 445 },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Support Services Enrollment</CardTitle>
        <CardDescription className="text-xs">Enrollment in psychosocial and peer support services</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            enrolled: { label: "Enrolled", color: "hsl(var(--chart-1))" },
            total: { label: "Total Eligible", color: "hsl(var(--chart-2))" },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="enrolled" fill="hsl(var(--chart-1))" />
              <Bar dataKey="total" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 space-y-1">
          {supportData.map((item, idx) => {
            const pct = ((item.enrolled / item.total) * 100).toFixed(1)
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate">{item.service}</span>
                <span className="font-semibold ml-1">
                  {item.enrolled} / {item.total} ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

