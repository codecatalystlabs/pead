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
      cd4Low: 12,
      tbScreened: 287,
      tbPositive: 8,
      tbTreated: 8,
      tptGiven: 245,
      ctxGiven: 275,
      malScreened: 287,
      malPositive: 12,
      malTreated: 12,
      cragTested: 0,
      cragPositive: 0,
    },
    {
      ageGroup: "5 - 9 years",
      eligible: 312,
      cd4Tested: 298,
      cd4Low: 15,
      tbScreened: 312,
      tbPositive: 6,
      tbTreated: 6,
      tptGiven: 268,
      ctxGiven: 302,
      malScreened: 312,
      malPositive: 9,
      malTreated: 9,
      cragTested: 0,
      cragPositive: 0,
    },
    {
      ageGroup: "10 - 14 years",
      eligible: 418,
      cd4Tested: 405,
      cd4Low: 18,
      tbScreened: 418,
      tbPositive: 14,
      tbTreated: 14,
      tptGiven: 356,
      ctxGiven: 398,
      malScreened: 418,
      malPositive: 15,
      malTreated: 15,
      cragTested: 405,
      cragPositive: 8,
      lpDone: 8,
      csfNegative: 5,
      preemptiveTx: 5,
      csfPositive: 3,
      cmTx: 3,
    },
    {
      ageGroup: "15 - 19 years",
      eligible: 356,
      cd4Tested: 334,
      cd4Low: 16,
      tbScreened: 356,
      tbPositive: 11,
      tbTreated: 11,
      tptGiven: 302,
      ctxGiven: 342,
      malScreened: 356,
      malPositive: 18,
      malTreated: 18,
      cragTested: 334,
      cragPositive: 6,
      lpDone: 6,
      csfNegative: 4,
      preemptiveTx: 4,
      csfPositive: 2,
      cmTx: 2,
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
          className="h-[250px]"
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
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <h4 className="font-semibold mb-1">CD4 &lt; 200</h4>
            <div className="space-y-1">
              {data.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate">{item.ageGroup}</span>
                  <span className="font-medium text-red-600 ml-1">{item.cd4Low}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">TB Pos/Tx</h4>
            <div className="space-y-1">
              {data.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate">{item.ageGroup}</span>
                  <span className="font-medium ml-1">
                    <span className="text-red-600">{item.tbPositive}</span>/
                    <span className="text-green-600">{item.tbTreated}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
