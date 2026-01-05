"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function AHDScreening() {
  const data = [
    {
      ageGroup: "< 5 years",
      eligible: 287,
      cd4Tested: 268,
      tbScreened: 287,
      tbPositive: 8,
      malScreened: 287,
      malPositive: 12,
    },
    {
      ageGroup: "5 - 9 years",
      eligible: 312,
      cd4Tested: 298,
      tbScreened: 312,
      tbPositive: 6,
      malScreened: 312,
      malPositive: 9,
    },
    {
      ageGroup: "10 - 14 years",
      eligible: 418,
      cd4Tested: 405,
      tbScreened: 418,
      tbPositive: 14,
      malScreened: 418,
      malPositive: 15,
    },
    {
      ageGroup: "15 - 19 years",
      eligible: 356,
      cd4Tested: 334,
      tbScreened: 356,
      tbPositive: 11,
      malScreened: 356,
      malPositive: 18,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced HIV Disease (AHD) Screening</CardTitle>
        <CardDescription>Screening coverage and positivity rates by age group</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            cd4Tested: { label: "CD4 Tested", color: "hsl(var(--chart-1))" },
            tbScreened: { label: "TB Screened", color: "hsl(var(--chart-2))" },
            malScreened: { label: "Malnutrition Screened", color: "hsl(var(--chart-3))" },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar yAxisId="left" dataKey="cd4Tested" fill="hsl(var(--chart-1))" />
              <Bar yAxisId="left" dataKey="tbScreened" fill="hsl(var(--chart-2))" />
              <Bar yAxisId="left" dataKey="malScreened" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">TB Positivity by Age</h4>
            <div className="space-y-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.ageGroup}</span>
                  <span className="font-medium text-red-600">{item.tbPositive} positive</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Malnutrition by Age</h4>
            <div className="space-y-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.ageGroup}</span>
                  <span className="font-medium text-orange-600">{item.malPositive} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
