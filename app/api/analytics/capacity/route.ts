import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, isYes, sumPaths } from "@/lib/jsonMetric"
import { CAPACITY_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })

  let totalHw = 0
  let trained = 0
  let orientedEligible = 0
  let oriented = 0
  let inCare = 0
  let keptAppointments = 0
  let supportSupervision = 0
  let mentorships = 0
  let normalizedTrainingRows = 0
  let normalizedTotalRows = 0

  for (const row of rows) {
    const flat = flattenToLowerMap(row.data)
    const eligible = sumPaths(flat, CAPACITY_PATHS.staffEligible)
    const trainedTotal = sumPaths(flat, CAPACITY_PATHS.staffTrained)
    const trainedByDomain = sumPaths(flat, CAPACITY_PATHS.staffTrainedByDomain)
    const trainedAtSite = Math.max(trainedTotal, trainedByDomain)
    const totalAtSite = Math.max(eligible, trainedAtSite)

    if (trainedAtSite !== trainedTotal || trainedAtSite !== trainedByDomain) normalizedTrainingRows += 1
    if (totalAtSite !== eligible) normalizedTotalRows += 1

    totalHw += totalAtSite
    trained += trainedAtSite
    orientedEligible += sumPaths(flat, CAPACITY_PATHS.paldOrientedEligible)
    oriented += sumPaths(flat, CAPACITY_PATHS.paldOriented)
    inCare += sumPaths(flat, CAPACITY_PATHS.inCare)
    keptAppointments += sumPaths(flat, CAPACITY_PATHS.retentionKept)
    if (isYes(flat, CAPACITY_PATHS.supportSupervision)) supportSupervision += 1
    if (isYes(flat, CAPACITY_PATHS.mentorship)) mentorships += 1
  }

  const data = [
    { cadre: "Integration-trained", trained, total: totalHw, pct: totalHw > 0 ? Math.round((trained / totalHw) * 1000) / 10 : 0 },
    { cadre: "pALD-oriented", trained: oriented, total: orientedEligible, pct: orientedEligible > 0 ? Math.round((oriented / orientedEligible) * 1000) / 10 : 0 },
  ]

  const retentionData = [
    { cohort: "Expected for review", active: inCare, ltfu: 0, dead: 0, transferredOut: 0, transferredIn: 0 },
    { cohort: "Kept appointments", active: keptAppointments, ltfu: 0, dead: 0, transferredOut: 0, transferredIn: 0 },
  ]

  const dataQualityWarnings: string[] = []
  if (normalizedTrainingRows > 0) {
    dataQualityWarnings.push(
      `${normalizedTrainingRows} submission(s) had inconsistent trained-staff fields; totals were normalized.`,
    )
  }
  if (normalizedTotalRows > 0) {
    dataQualityWarnings.push(
      `${normalizedTotalRows} submission(s) had eligible staff lower than trained counts; denominators were normalized.`,
    )
  }

  return NextResponse.json(
    {
      data,
      retentionData,
      dataQualityWarnings,
      capacityBuilding: [
        { item: "Trainings", value: trained },
        { item: "Mentorships", value: mentorships },
        { item: "Support supervision", value: supportSupervision },
      ],
    },
    { headers: NO_STORE },
  )
}
