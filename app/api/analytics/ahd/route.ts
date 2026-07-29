import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, isYes } from "@/lib/jsonMetric"
import { AGE_BAND_KEYS, ahdForAge, AHD_COMMODITY_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

type PopMetrics = ReturnType<typeof ahdForAge>["byPopulation"]["newlyDiagnosed"]

function emptyPop(): PopMetrics {
  return {
    identified: 0,
    cd4Below200: 0,
    malScreened: 0,
    malnourished: 0,
    malIntervention: 0,
    tbTested: 0,
    tbPositive: 0,
    tbTreatment: 0,
    cragScreened: 0,
    cragPositive: 0,
    cmTreatment: 0,
  }
}

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })

  const byPop = {
    newlyDiagnosed: emptyPop(),
    unsuppressed: emptyPop(),
    reEngaged: emptyPop(),
  }

  const byAge = AGE_BAND_KEYS.map((ageGroup) => ({
    ageGroup,
    newlyDiagnosed: emptyPop(),
    unsuppressed: emptyPop(),
    reEngaged: emptyPop(),
  }))

  const commodityYes: Record<string, number> = {}
  const commodityNo: Record<string, number> = {}
  for (const item of [...AHD_COMMODITY_PATHS.lab, ...AHD_COMMODITY_PATHS.drugs]) {
    commodityYes[item.key] = 0
    commodityNo[item.key] = 0
  }

  for (const row of rows) {
    const flat = flattenToLowerMap(row.data)
    AGE_BAND_KEYS.forEach((band, idx) => {
      const m = ahdForAge(flat, band)
      for (const pop of ["newlyDiagnosed", "unsuppressed", "reEngaged"] as const) {
        const src = m.byPopulation[pop]
        const destAge = byAge[idx][pop]
        const destPop = byPop[pop]
        for (const k of Object.keys(src) as (keyof PopMetrics)[]) {
          destAge[k] += src[k]
          destPop[k] += src[k]
        }
      }
    })

    for (const item of [...AHD_COMMODITY_PATHS.lab, ...AHD_COMMODITY_PATHS.drugs]) {
      if (isYes(flat, [item.path])) commodityYes[item.key] += 1
      else if (String(flat[item.path] ?? "").toLowerCase() === "no") commodityNo[item.key] += 1
    }
  }

  const data = byAge.map((row) => ({
    ageGroup: row.ageGroup,
    hivCascade: {
      newlyDiagnosed: row.newlyDiagnosed.identified,
      unsuppressed: row.unsuppressed.identified,
      reEngaged: row.reEngaged.identified,
      cd4Below200:
        row.newlyDiagnosed.cd4Below200 + row.unsuppressed.cd4Below200 + row.reEngaged.cd4Below200,
    },
    populations: {
      newlyDiagnosed: row.newlyDiagnosed,
      unsuppressed: row.unsuppressed,
      reEngaged: row.reEngaged,
    },
  }))

  const ahdCommodities = [...AHD_COMMODITY_PATHS.lab, ...AHD_COMMODITY_PATHS.drugs].map((item) => ({
    item: item.key,
    available: commodityYes[item.key],
    unavailable: commodityNo[item.key],
    category: AHD_COMMODITY_PATHS.lab.some((l) => l.key === item.key) ? "Lab" : "Drugs",
  }))

  return NextResponse.json(
    {
      data,
      byPopulation: byPop,
      ahdCommodities,
    },
    { headers: NO_STORE },
  )
}
