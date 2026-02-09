"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function WeightBandDistribution() {
  const data = [
    { band: "3 - 5.9 kg", clhiv: 145, alhiv: 0 },
    { band: "6 - 9.9 kg", clhiv: 198, alhiv: 0 },
    { band: "10 - 13.9 kg", clhiv: 267, alhiv: 0 },
    { band: "14 - 19.9 kg", clhiv: 312, alhiv: 0 },
    { band: "20 - 24.9 kg", clhiv: 289, alhiv: 156 },
    { band: "25 - 29.9 kg", clhiv: 0, alhiv: 423 },
    { band: "≥30 kg", clhiv: 0, alhiv: 1213 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>CALHIV Distribution by Weight Band</CardTitle>
        <CardDescription>Number of CALHIV receiving care by weight band</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            clhiv: { label: "CLHIV", color: "hsl(var(--chart-1))" },
            alhiv: { label: "ALHIV", color: "hsl(var(--chart-2))" },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="band" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="clhiv" fill="hsl(var(--chart-1))" />
              <Bar dataKey="alhiv" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm">CLHIV by Weight Band</h4>
            <div className="space-y-1">
              {data
                .filter((item) => item.clhiv > 0)
                .map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{item.band}</span>
                    <span className="font-medium">{item.clhiv}</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">ALHIV by Weight Band</h4>
            <div className="space-y-1">
              {data
                .filter((item) => item.alhiv > 0)
                .map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{item.band}</span>
                    <span className="font-medium">{item.alhiv}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

