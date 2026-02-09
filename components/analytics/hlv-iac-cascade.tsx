"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function HLVIACCascade() {
  const data = [
    {
      ageGroup: "0 - 4 years",
      hlv: 45,
      iac0: 8,
      iac1: 5,
      iac2: 7,
      iac3: 12,
      iac4Plus: 13,
      suppressed: 18,
      unsuppressed: 7,
      drReferred: 2,
    },
    {
      ageGroup: "5 - 9 years",
      hlv: 52,
      iac0: 9,
      iac1: 6,
      iac2: 8,
      iac3: 14,
      iac4Plus: 15,
      suppressed: 22,
      unsuppressed: 7,
      drReferred: 3,
    },
    {
      ageGroup: "10 - 14 years",
      hlv: 68,
      iac0: 12,
      iac1: 8,
      iac2: 10,
      iac3: 18,
      iac4Plus: 20,
      suppressed: 28,
      unsuppressed: 10,
      drReferred: 4,
    },
    {
      ageGroup: "15 - 19 years",
      hlv: 58,
      iac0: 10,
      iac1: 7,
      iac2: 9,
      iac3: 15,
      iac4Plus: 17,
      suppressed: 24,
      unsuppressed: 8,
      drReferred: 3,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>High-Level Viremia (HLV) & IAC Cascade</CardTitle>
        <CardDescription>
          HLV (≥1,000 copies/mL) and Intensive Adherence Counseling (IAC) cascade by age group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            hlv: { label: "Total HLV", color: "hsl(var(--chart-1))" },
            iac3Plus: { label: "≥3 IAC Sessions", color: "hsl(var(--chart-2))" },
            suppressed: { label: "Suppressed After IAC", color: "hsl(var(--chart-3))" },
            unsuppressed: { label: "Unsuppressed After IAC", color: "hsl(var(--chart-4))" },
            drReferred: { label: "DR Testing Referred", color: "hsl(var(--chart-5))" },
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
              <Bar dataKey="hlv" fill="hsl(var(--chart-1))" />
              <Bar dataKey="iac3" fill="hsl(var(--chart-2))" />
              <Bar dataKey="iac4Plus" fill="hsl(var(--chart-2))" />
              <Bar dataKey="suppressed" fill="hsl(var(--chart-3))" />
              <Bar dataKey="unsuppressed" fill="hsl(var(--chart-4))" />
              <Bar dataKey="drReferred" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">IAC Completion (≥3 sessions)</h4>
            <div className="space-y-2">
              {data.map((item, idx) => {
                const iac3Plus = item.iac3 + item.iac4Plus
                const pct = ((iac3Plus / item.hlv) * 100).toFixed(1)
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

