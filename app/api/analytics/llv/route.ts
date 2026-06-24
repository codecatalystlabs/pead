import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters, parseFilterParams } from "@/lib/analyticsFilters"
import { filterRowsByAgeBand } from "@/lib/ageBand"
import { flattenToLowerMap, sumPaths } from "@/lib/jsonMetric"
import { AGE_BAND_KEYS, llvPaths, type AgeBandKey } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })
  const byAge: Record<AgeBandKey, {
    llv: number
    iac1: number
    iac2: number
    iac3: number
    iac4Plus: number
    repeatViralLoad: number
    suppressed: number
    stillLLVorHLV: number
    missingRepeat: number
  }> = {
    "0 - 4 years": { llv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, repeatViralLoad: 0, suppressed: 0, stillLLVorHLV: 0, missingRepeat: 0 },
    "5 - 9 years": { llv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, repeatViralLoad: 0, suppressed: 0, stillLLVorHLV: 0, missingRepeat: 0 },
    "10 - 14 years": { llv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, repeatViralLoad: 0, suppressed: 0, stillLLVorHLV: 0, missingRepeat: 0 },
    "15 - 19 years": { llv: 0, iac1: 0, iac2: 0, iac3: 0, iac4Plus: 0, repeatViralLoad: 0, suppressed: 0, stillLLVorHLV: 0, missingRepeat: 0 },
  }

  for (const row of rows) {
    const f = flattenToLowerMap(row.data)
    for (const band of AGE_BAND_KEYS) {
      byAge[band].llv += sumPaths(f, llvPaths("llv", band))
      byAge[band].iac1 += sumPaths(f, llvPaths("iac1", band))
      byAge[band].iac2 += sumPaths(f, llvPaths("iac2", band))
      byAge[band].iac3 += sumPaths(f, llvPaths("iac3", band))
      byAge[band].iac4Plus += sumPaths(f, llvPaths("iac4Plus", band))
      byAge[band].suppressed += sumPaths(f, llvPaths("suppressed", band))
      byAge[band].stillLLVorHLV += sumPaths(f, llvPaths("stillLLVorHLV", band))
    }
  }

  const params = parseFilterParams(req.url)
  const data = filterRowsByAgeBand(
    AGE_BAND_KEYS.map((ageGroup) => {
      const row = byAge[ageGroup]
      const repeatViralLoad = row.iac1 + row.iac2 + row.iac3 + row.iac4Plus
      const missingRepeat = Math.max(0, row.llv - repeatViralLoad)
      return { ageGroup, ...row, repeatViralLoad, missingRepeat }
    }),
    params.ageBand,
  )

  return NextResponse.json({ data }, { headers: NO_STORE })
}
