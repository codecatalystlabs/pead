import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, sumPaths } from "@/lib/jsonMetric"
import { aggregatePaldFromFlat, aggregateVlFromFlat, CAPACITY_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const EMPTY_SUMMARY = {
  totalCalhiv: 0,
  careIntegrationRate: 0,
  paldTransitionRate: 0,
  paldTransitionNumerator: 0,
  staffTrainingCoverage: 0,
  vlSuppressionRate: 0,
  vlSuppressed: 0,
  totalVlEligible: 0,
  paldEligible: 0,
  paldOnPald: 0,
  trainedHw: 0,
  totalHw: 0,
  submissionCount: 0,
  dataQualityWarnings: [],
  noData: true,
  message: "No data for the selected filters or period.",
}

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>
    const rows = await prisma.submission.findMany({ where, select: { data: true } })

    if (!rows.length) {
      return NextResponse.json({ ...EMPTY_SUMMARY }, { status: 200, headers: NO_STORE })
    }

    let totalCalhiv = 0
    let vlSuppressed = 0
    let totalVlEligible = 0
    let trainedHw = 0
    let totalHw = 0
    let paldEligible = 0
    let paldOnPald = 0

    for (const row of rows) {
      const f = flattenToLowerMap(row.data)
      const pald = aggregatePaldFromFlat(f)
      const vl = aggregateVlFromFlat(f)
      totalCalhiv += pald.totalCalhiv
      paldEligible += pald.paldEligible
      paldOnPald += pald.paldOnPald
      vlSuppressed += vl.suppressed
      totalVlEligible += vl.updated

      const eligible = sumPaths(f, CAPACITY_PATHS.staffEligible)
      const trainedTotal = sumPaths(f, CAPACITY_PATHS.staffTrained)
      const trainedByDomain = sumPaths(f, CAPACITY_PATHS.staffTrainedByDomain)
      const trainedAtSite = Math.max(trainedTotal, trainedByDomain)
      totalHw += Math.max(eligible, trainedAtSite)
      trainedHw += trainedAtSite
    }

    const careIntegrationRate = Math.min(100, totalCalhiv > 0 ? (paldOnPald / totalCalhiv) * 100 : 0)
    const paldTransitionNumerator = Math.min(paldOnPald, paldEligible)
    const paldTransitionRate = Math.min(100, paldEligible > 0 ? (paldTransitionNumerator / paldEligible) * 100 : 0)
    const staffTrainingCoverage = Math.min(100, totalHw > 0 ? (trainedHw / totalHw) * 100 : 0)
    const vlSuppressionRate = Math.min(100, totalVlEligible > 0 ? (vlSuppressed / totalVlEligible) * 100 : 0)

    const dataQualityWarnings: string[] = []
    if (paldOnPald > paldEligible && paldEligible > 0) {
      dataQualityWarnings.push(
        `Reported on pALD (${paldOnPald.toLocaleString()}) exceeds pALD-eligible counts (${paldEligible.toLocaleString()}); transition rate is capped.`,
      )
    }

    return NextResponse.json(
      {
        totalCalhiv,
        careIntegrationRate,
        paldTransitionRate,
        paldTransitionNumerator,
        staffTrainingCoverage,
        vlSuppressionRate,
        vlSuppressed,
        totalVlEligible,
        paldEligible,
        paldOnPald,
        trainedHw,
        totalHw,
        submissionCount: rows.length,
        dataQualityWarnings,
        noData: false,
      },
      { status: 200, headers: NO_STORE },
    )
  } catch {
    return NextResponse.json({ ...EMPTY_SUMMARY }, { status: 200, headers: NO_STORE })
  }
}
