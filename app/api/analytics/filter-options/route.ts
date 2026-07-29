import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildSubmissionWhere } from "@/lib/analyticsWhere"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

/** Distinct region → district → facility triples for cascading filters. */
export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where = buildSubmissionWhere(auth) as Record<string, unknown>

  const [rows, periods] = await Promise.all([
    prisma.submission.groupBy({
      by: ["region", "district", "facility"],
      where,
    }),
    prisma.submission.findMany({
      where,
      select: { A_5_Reporting_period_quarter: true },
      distinct: ["A_5_Reporting_period_quarter"],
    }),
  ])

  const trim = (s: string | null | undefined) => (s && s.trim()) || ""

  const cascade: { region: string; district: string; facility: string }[] = []
  for (const r of rows) {
    const region = trim(r.region)
    const district = trim(r.district)
    const facility = trim(r.facility)
    if (!region && !district && !facility) continue
    cascade.push({ region, district, facility })
  }

  const region = [...new Set(cascade.map((c) => c.region).filter(Boolean))].sort()
  const district = [...new Set(cascade.map((c) => c.district).filter(Boolean))].sort()
  const facility = [...new Set(cascade.map((c) => c.facility).filter(Boolean))].sort()
  const reportingPeriod = periods
    .map((p) => trim(p.A_5_Reporting_period_quarter))
    .filter(Boolean)
    .sort()

  return NextResponse.json(
    {
      region,
      district,
      facility,
      reportingPeriod,
      cascade,
    },
    { headers: NO_STORE },
  )
}
