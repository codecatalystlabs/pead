import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, sumPaths } from "@/lib/jsonMetric"
import { COMMODITY_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })
  let mosPALD = 0
  let mosAbc3tc = 0
  let mosDtg10 = 0
  let mosAzt3tc = 0
  let mosDrv = 0
  let count = 0

  for (const row of rows) {
    const f = flattenToLowerMap(row.data)
    mosPALD += sumPaths(f, COMMODITY_PATHS.mosPALD)
    mosAbc3tc += sumPaths(f, COMMODITY_PATHS.mosAbc3tc)
    mosDtg10 += sumPaths(f, COMMODITY_PATHS.mosDtg10)
    mosAzt3tc += sumPaths(f, COMMODITY_PATHS.mosAzt3tc)
    mosDrv += sumPaths(f, COMMODITY_PATHS.mosDrv)
    count += 1
  }

  const avg = (n: number) => (count > 0 ? Math.round((n / count) * 10) / 10 : 0)
  const data = [
    { commodity: "ABC/3TC/DTG (pALD)", mos: avg(mosPALD) },
    { commodity: "ABC/3TC 120/60", mos: avg(mosAbc3tc) },
    { commodity: "DTG 10 mg", mos: avg(mosDtg10) },
    { commodity: "AZT/3TC 60/30", mos: avg(mosAzt3tc) },
    { commodity: "Darunavir", mos: avg(mosDrv) },
  ]

  return NextResponse.json({ data }, { headers: NO_STORE })
}
