import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters, parseFilterParams } from "@/lib/analyticsFilters"
import { filterRowsByAgeBand } from "@/lib/ageBand"
import { flattenToLowerMap, sumPaths } from "@/lib/jsonMetric"
import { AGE_BAND_KEYS, HLV_METRICS, hlvPaths, type AgeBandKey } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })
  const byAge: Record<AgeBandKey, {
    hlv: number
    iac1: number
    iac2: number
    iac3: number
    iac4Plus: number
    suppressed: number
    unsuppressed: number
    drReferred: number
    drSwitched: number
    repeatViralLoad: number
  }> = {
    "0 - 4 years": { hlv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, suppressed: 0, unsuppressed: 0, drReferred: 0, drSwitched: 0, repeatViralLoad: 0 },
    "5 - 9 years": { hlv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, suppressed: 0, unsuppressed: 0, drReferred: 0, drSwitched: 0, repeatViralLoad: 0 },
    "10 - 14 years": { hlv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, suppressed: 0, unsuppressed: 0, drReferred: 0, drSwitched: 0, repeatViralLoad: 0 },
    "15 - 19 years": { hlv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, suppressed: 0, unsuppressed: 0, drReferred: 0, drSwitched: 0, repeatViralLoad: 0 },
  }

  for (const row of rows) {
    const f = flattenToLowerMap(row.data)
    for (const band of AGE_BAND_KEYS) {
      byAge[band].hlv += sumPaths(f, hlvPaths(HLV_METRICS.hlv, band))
      byAge[band].iac1 += sumPaths(f, hlvPaths(HLV_METRICS.iac1, band))
      byAge[band].iac2 += sumPaths(f, hlvPaths(HLV_METRICS.iac2, band))
      byAge[band].iac3 += sumPaths(f, hlvPaths(HLV_METRICS.iac3, band))
      byAge[band].iac4Plus += sumPaths(f, hlvPaths(HLV_METRICS.iac4Plus, band))
      byAge[band].suppressed += sumPaths(f, hlvPaths(HLV_METRICS.suppressed, band))
      byAge[band].unsuppressed += sumPaths(f, hlvPaths(HLV_METRICS.unsuppressed, band))
      byAge[band].drReferred += sumPaths(f, hlvPaths(HLV_METRICS.drReferred, band))
      byAge[band].drSwitched += sumPaths(f, hlvPaths(HLV_METRICS.drSwitched, band))
    }
  }

  const params = parseFilterParams(req.url)
  const data = filterRowsByAgeBand(
    AGE_BAND_KEYS.map((ageGroup) => {
      const row = byAge[ageGroup]
      const repeatViralLoad = row.iac1 + row.iac2 + row.iac3 + row.iac4Plus
      return {
        ageGroup,
        ...row,
        repeatViralLoad,
        below1000: row.suppressed,
        aboveOrEq1000: row.unsuppressed,
        maintainedOnTreatment: Math.max(0, row.drReferred - row.drSwitched),
        switchedTreatment: row.drSwitched,
        treatmentSubstitution: 0,
      }
    }),
    params.ageBand,
  )

  return NextResponse.json({ data }, { headers: NO_STORE })
}
