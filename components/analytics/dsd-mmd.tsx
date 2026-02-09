"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function DSDMMD() {
  const mmdData = [
    { period: "3 Months", number: 1245, percentage: 43.7 },
    { period: "6 Months", number: 892, percentage: 31.3 },
  ]

  const dsdData = [
    { model: "CDDP", number: 456, percentage: 16.0 },
    { model: "CCLAD", number: 623, percentage: 21.9 },
    { model: "CRPDDP", number: 234, percentage: 8.2 },
    { model: "FBIM", number: 892, percentage: 31.3 },
    { model: "FBG", number: 342, percentage: 12.0 },
    { model: "FTDR", number: 300, percentage: 10.5 },
  ]

  const supportData = [
    { service: "Psychosocial Support", enrolled: 156, total: 223 },
    { service: "Peer Support/Teen Club", enrolled: 289, total: 445 },
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Month Dispensing (MMD)</CardTitle>
          <CardDescription>CALHIV receiving multi-month drug refills</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              number: { label: "Number of Patients", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mmdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="number" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {mmdData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{item.period}</span>
                <span className="font-semibold">
                  {item.number.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Differentiated Service Delivery (DSD) Models</CardTitle>
          <CardDescription>Distribution of CALHIV across DSD models</CardDescription>
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
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dsdData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ model, percentage }) => `${model}: ${percentage}%`}
                  outerRadius={100}
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
          <div className="mt-4 space-y-2">
            {dsdData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
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

      <Card>
        <CardHeader>
          <CardTitle>Support Services Enrollment</CardTitle>
          <CardDescription>Enrollment in psychosocial and peer support services</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              enrolled: { label: "Enrolled", color: "hsl(var(--chart-1))" },
              total: { label: "Total Eligible", color: "hsl(var(--chart-2))" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="enrolled" fill="hsl(var(--chart-1))" />
                <Bar dataKey="total" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {supportData.map((item, idx) => {
              const pct = ((item.enrolled / item.total) * 100).toFixed(1)
              return (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{item.service}</span>
                  <span className="font-semibold">
                    {item.enrolled} / {item.total} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

