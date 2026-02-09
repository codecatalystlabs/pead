"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function LLVFollowUp() {
  const data = [
    {
      ageGroup: "0 - 4 years",
      llv: 38,
      iac0: 6,
      iac1: 4,
      iac2: 5,
      iac3: 10,
      iac4Plus: 13,
      suppressed: 18,
      stillLLVorHLV: 5,
    },
    {
      ageGroup: "5 - 9 years",
      llv: 42,
      iac0: 7,
      iac1: 5,
      iac2: 6,
      iac3: 11,
      iac4Plus: 13,
      suppressed: 20,
      stillLLVorHLV: 4,
    },
    {
      ageGroup: "10 - 14 years",
      llv: 55,
      iac0: 9,
      iac1: 6,
      iac2: 8,
      iac3: 14,
      iac4Plus: 18,
      suppressed: 26,
      stillLLVorHLV: 6,
    },
    {
      ageGroup: "15 - 19 years",
      llv: 48,
      iac0: 8,
      iac1: 5,
      iac2: 7,
      iac3: 13,
      iac4Plus: 15,
      suppressed: 22,
      stillLLVorHLV: 6,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low-Level Viremia (LLV) Follow-Up</CardTitle>
        <CardDescription>
          LLV (200-999 copies/mL) and IAC follow-up by age group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            llv: { label: "Total LLV", color: "hsl(var(--chart-1))" },
            iac3Plus: { label: "≥3 IAC Sessions", color: "hsl(var(--chart-2))" },
            suppressed: { label: "Suppressed After IAC", color: "hsl(var(--chart-3))" },
            stillLLVorHLV: { label: "Still LLV or Progressed to HLV", color: "hsl(var(--chart-4))" },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="llv" fill="hsl(var(--chart-1))" />
              <Bar dataKey="iac3" fill="hsl(var(--chart-2))" />
              <Bar dataKey="iac4Plus" fill="hsl(var(--chart-2))" />
              <Bar dataKey="suppressed" fill="hsl(var(--chart-3))" />
              <Bar dataKey="stillLLVorHLV" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">IAC Completion (≥3 sessions)</h4>
            <div className="space-y-2">
              {data.map((item, idx) => {
                const iac3Plus = item.iac3 + item.iac4Plus
                const pct = ((iac3Plus / item.llv) * 100).toFixed(1)
                return (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.ageGroup}</span>
                    <span className="font-medium">{iac3Plus} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Suppression After IAC</h4>
            <div className="space-y-2">
              {data.map((item, idx) => {
                const iac3Plus = item.iac3 + item.iac4Plus
                const pct = iac3Plus > 0 ? ((item.suppressed / iac3Plus) * 100).toFixed(1) : "0.0"
                return (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.ageGroup}</span>
                    <span className="font-medium text-green-600">{item.suppressed} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

