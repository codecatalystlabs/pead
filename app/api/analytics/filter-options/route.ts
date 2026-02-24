import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildSubmissionWhere } from "@/lib/analyticsWhere"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where = buildSubmissionWhere(auth) as Record<string, unknown>

  const [regions, districts, facilities, periods] = await Promise.all([
    prisma.submission.findMany({ where, select: { region: true }, distinct: ["region"] }),
    prisma.submission.findMany({ where, select: { district: true }, distinct: ["district"] }),
    prisma.submission.findMany({ where, select: { facility: true }, distinct: ["facility"] }),
    prisma.submission.findMany({ where, select: { A_5_Reporting_period_quarter: true }, distinct: ["A_5_Reporting_period_quarter"] }),
  ])

  const trimOpt = (s: string | null) => (s && s.trim()) || null
  const regionOptions = regions.map((r) => trimOpt(r.region)).filter(Boolean) as string[]
  const districtOptions = districts.map((d) => trimOpt(d.district)).filter(Boolean) as string[]
  const facilityOptions = facilities.map((f) => trimOpt(f.facility)).filter(Boolean) as string[]
  const reportingPeriodOptions = periods.map((p) => trimOpt(p.A_5_Reporting_period_quarter)).filter(Boolean) as string[]

  return NextResponse.json(
    {
      region: regionOptions.sort(),
      district: districtOptions.sort(),
      facility: facilityOptions.sort(),
      reportingPeriod: reportingPeriodOptions.sort(),
    },
    { headers: NO_STORE },
  )
}
