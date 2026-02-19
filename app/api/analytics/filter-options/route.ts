import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildSubmissionWhere } from "@/lib/analyticsWhere"

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

  const regionOptions = regions.map((r) => r.region).filter(Boolean) as string[]
  const districtOptions = districts.map((d) => d.district).filter(Boolean) as string[]
  const facilityOptions = facilities.map((f) => f.facility).filter(Boolean) as string[]
  const reportingPeriodOptions = periods.map((p) => p.A_5_Reporting_period_quarter).filter(Boolean) as string[]

  return NextResponse.json({
    region: regionOptions.sort(),
    district: districtOptions.sort(),
    facility: facilityOptions.sort(),
    reportingPeriod: reportingPeriodOptions.sort(),
  })
}
