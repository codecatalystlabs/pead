"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function PALDTransitionDetails() {
  const weightBandData = [
    { band: "3 - 5.9 kg", eligible: 145, transitioned: 132, pct: 91.0 },
    { band: "6 - 9.9 kg", eligible: 198, transitioned: 178, pct: 89.9 },
    { band: "10 - 13.9 kg", eligible: 267, transitioned: 245, pct: 91.8 },
    { band: "14 - 19.9 kg", eligible: 312, transitioned: 287, pct: 92.0 },
    { band: "20 - 24.9 kg", eligible: 289, transitioned: 265, pct: 91.7 },
  ]

  const ageBandData = [
    { age: "< 5 years", eligible: 610, transitioned: 555, pct: 91.0 },
    { age: "5 - 9 years", eligible: 767, transitioned: 710, pct: 92.6 },
    { age: "10 - 14 years", eligible: 423, transitioned: 389, pct: 92.0 },
    { age: "15 - 19 years", eligible: 1047, transitioned: 952, pct: 90.9 },
  ]

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>pALD Transition by Weight Band</CardTitle>
          <CardDescription>Eligible vs transitioned to pALD by weight band</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              eligible: { label: "Eligible", color: "hsl(var(--chart-1))" },
              transitioned: { label: "Transitioned", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightBandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="band" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="eligible" fill="hsl(var(--chart-1))" />
                <Bar dataKey="transitioned" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {weightBandData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{item.band}</span>
                <span className="font-semibold text-green-600">{item.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>pALD Transition by Age Band</CardTitle>
          <CardDescription>Eligible vs transitioned to pALD by age group</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              eligible: { label: "Eligible", color: "hsl(var(--chart-1))" },
              transitioned: { label: "Transitioned", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageBandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="eligible" fill="hsl(var(--chart-1))" />
                <Bar dataKey="transitioned" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {ageBandData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{item.age}</span>
                <span className="font-semibold text-green-600">{item.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

