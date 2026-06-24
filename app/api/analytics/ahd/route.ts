import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap } from "@/lib/jsonMetric"
import { AGE_BAND_KEYS, ahdForAge } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })
  const totals = Object.fromEntries(
    AGE_BAND_KEYS.map((band) => [
      band,
      {
        newlyDiagnosed: 0,
        unsuppressed: 0,
        reEngaged: 0,
        cd4: 0,
        tbScreened: 0,
        tbPositive: 0,
        tbTreatment: 0,
        cragScreened: 0,
        cragPositive: 0,
        cmTreatment: 0,
      },
    ]),
  ) as Record<
    (typeof AGE_BAND_KEYS)[number],
    ReturnType<typeof ahdForAge>
  >

  for (const row of rows) {
    const flat = flattenToLowerMap(row.data)
    for (const band of AGE_BAND_KEYS) {
      const m = ahdForAge(flat, band)
      for (const key of Object.keys(m) as (keyof typeof m)[]) {
        totals[band][key] += m[key]
      }
    }
  }

  const data = AGE_BAND_KEYS.map((ageGroup) => {
    const t = totals[ageGroup]
    return {
      ageGroup,
      screened: t.newlyDiagnosed,
      cd4: t.cd4,
      tb: t.tbPositive,
      malnutrition: t.reEngaged,
      crag: t.cragPositive > 0 ? t.cragPositive : null,
      hivCascade: {
        newlyDiagnosed: t.newlyDiagnosed,
        unsuppressed: t.unsuppressed,
        reEngaged: t.reEngaged,
        cd4Below200: t.cd4,
      },
      tbCascade: {
        screened: t.tbScreened,
        positive: t.tbPositive,
        onTreatment: t.tbTreatment,
      },
      meningitisCascade: {
        screened: t.cragScreened,
        positive: t.cragPositive,
        onTreatment: t.cmTreatment,
      },
    }
  })

  return NextResponse.json({ data }, { headers: NO_STORE })
}
