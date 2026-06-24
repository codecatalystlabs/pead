import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters, parseFilterParams } from "@/lib/analyticsFilters"
import { filterRowsByAgeBand } from "@/lib/ageBand"
import { flattenToLowerMap, sumPaths } from "@/lib/jsonMetric"
import { AGE_BAND_KEYS, VL_PATHS, PALD_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })
  const totals = Object.fromEntries(AGE_BAND_KEYS.map((b) => [b, { updated: 0, suppressed: 0 }])) as Record<
    (typeof AGE_BAND_KEYS)[number],
    { updated: number; suppressed: number }
  >

  for (const row of rows) {
    const flat = flattenToLowerMap(row.data)
    for (const band of AGE_BAND_KEYS) {
      const inCare = sumPaths(flat, PALD_PATHS.inCareByAge[band])
      const cap = inCare > 0 ? inCare : Number.POSITIVE_INFINITY
      const updated = Math.min(cap, sumPaths(flat, VL_PATHS.updated[band]))
      const suppressed = Math.min(updated, sumPaths(flat, VL_PATHS.suppressed[band]))
      totals[band].updated += updated
      totals[band].suppressed += suppressed
    }
  }

  const totalUpdated = AGE_BAND_KEYS.reduce((s, b) => s + totals[b].updated, 0)
  const totalSuppressed = AGE_BAND_KEYS.reduce((s, b) => s + totals[b].suppressed, 0)
  const vlSuppressionRate = totalUpdated > 0 ? Math.round((totalSuppressed / totalUpdated) * 1000) / 10 : 0

  const params = parseFilterParams(req.url)
  const data = filterRowsByAgeBand(
    AGE_BAND_KEYS.map((ageGroup) => ({
      ageGroup,
      updated: totals[ageGroup].updated,
      suppressed: totals[ageGroup].suppressed,
      dtgPct: 0,
      suppressedPct:
        totals[ageGroup].updated > 0
          ? Math.round((totals[ageGroup].suppressed / totals[ageGroup].updated) * 1000) / 10
          : 0,
    })),
    params.ageBand,
  )

  return NextResponse.json({ data, totalUpdated, totalSuppressed, vlSuppressionRate }, { headers: NO_STORE })
}
