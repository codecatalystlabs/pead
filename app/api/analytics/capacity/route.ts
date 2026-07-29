import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, firstString, isYes, sumPaths } from "@/lib/jsonMetric"
import { CAPACITY_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const D = "section_d"
const E = "section_e"

function pushUnique(arr: string[], v: string | null) {
  if (!v) return
  const t = v.trim()
  if (t && !arr.includes(t)) arr.push(t)
}

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })

  let totalHw = 0
  let trained = 0
  let orientedEligible = 0
  let oriented = 0
  let expectedReview = 0
  let keptAppointments = 0
  let supportSupervision = 0
  let mentorships = 0
  let normalizedTrainingRows = 0
  let normalizedTotalRows = 0

  const cadre = {
    administrative: 0,
    counselling: 0,
    medical: 0,
    nursing: 0,
    support: 0,
  }

  let integratingYes = 0
  let integratingNo = 0
  let orientedYes = 0
  const services: Record<string, number> = {}
  const topicsCovered: Record<string, number> = {}
  const integrationNarrative = {
    challenges: [] as string[],
    innovations: [] as string[],
    recommendations: [] as string[],
    supportNeeded: [] as string[],
    topicsCovered,
  }

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
    expectedReview += sumPaths(flat, CAPACITY_PATHS.retentionExpected)
    keptAppointments += sumPaths(flat, CAPACITY_PATHS.retentionKept)
    if (isYes(flat, CAPACITY_PATHS.supportSupervision)) supportSupervision += 1
    if (isYes(flat, CAPACITY_PATHS.mentorship)) mentorships += 1

    cadre.administrative += sumPaths(flat, [`${D}.care_model_adopted.administrative_staff_trained`])
    cadre.counselling += sumPaths(flat, [`${D}.care_model_adopted.counselling_staff_trained`])
    cadre.medical += sumPaths(flat, [`${D}.care_model_adopted.medical_and_clinical_officers_trained`])
    cadre.nursing += sumPaths(flat, [`${D}.care_model_adopted.nursing_staff_trained`])
    cadre.support += sumPaths(flat, [`${D}.care_model_adopted.support_staff_trained`])

    if (isYes(flat, [`${D}.care_model_adopted.hf_currently_integrating_services`])) integratingYes += 1
    else if (String(flat[`${D}.care_model_adopted.hf_currently_integrating_services`] ?? "").toLowerCase() === "no") integratingNo += 1
    if (isYes(flat, [`${D}.care_model_adopted.hf_received_orientation`])) orientedYes += 1

    const svcRaw = firstString(flat, [`${D}.care_model_adopted.services_offered_in_intergraton`])
    if (svcRaw) {
      for (const s of svcRaw.split(/[\s,]+/).filter(Boolean)) {
        services[s] = (services[s] ?? 0) + 1
      }
    }

    const topics = firstString(flat, [`${E}.capacity_building_at_hf.topics_covered`])
    if (topics) {
      for (const t of topics.split(/[\s,]+/).filter(Boolean)) {
        topicsCovered[t] = (topicsCovered[t] ?? 0) + 1
      }
    }

    pushUnique(integrationNarrative.challenges, firstString(flat, [`${D}.description_of_care_models.challenges_surrounding_the_implementation`]))
    pushUnique(integrationNarrative.innovations, firstString(flat, [`${D}.description_of_care_models.innovations_that_have_been_developed`]))
    pushUnique(integrationNarrative.recommendations, firstString(flat, [`${D}.description_of_care_models.recommendations`]))
    pushUnique(integrationNarrative.supportNeeded, firstString(flat, [`${D}.description_of_care_models.areas_where_this_hf_needs_support`]))
  }

  const data = [
    {
      cadre: "All cadres (integration-trained)",
      trained,
      total: totalHw,
      pct: totalHw > 0 ? Math.round((trained / totalHw) * 1000) / 10 : 0,
    },
    {
      cadre: "Administrative",
      trained: cadre.administrative,
      total: totalHw,
      pct: totalHw > 0 ? Math.round((cadre.administrative / totalHw) * 1000) / 10 : 0,
    },
    {
      cadre: "Counselling",
      trained: cadre.counselling,
      total: totalHw,
      pct: totalHw > 0 ? Math.round((cadre.counselling / totalHw) * 1000) / 10 : 0,
    },
    {
      cadre: "Medical / clinical officers",
      trained: cadre.medical,
      total: totalHw,
      pct: totalHw > 0 ? Math.round((cadre.medical / totalHw) * 1000) / 10 : 0,
    },
    {
      cadre: "Nursing",
      trained: cadre.nursing,
      total: totalHw,
      pct: totalHw > 0 ? Math.round((cadre.nursing / totalHw) * 1000) / 10 : 0,
    },
    {
      cadre: "Support staff",
      trained: cadre.support,
      total: totalHw,
      pct: totalHw > 0 ? Math.round((cadre.support / totalHw) * 1000) / 10 : 0,
    },
    {
      cadre: "pALD-oriented",
      trained: oriented,
      total: orientedEligible,
      pct: orientedEligible > 0 ? Math.round((oriented / orientedEligible) * 1000) / 10 : 0,
    },
  ]

  const retentionData = [
    {
      cohort: "Expected for review",
      active: expectedReview,
      ltfu: 0,
      dead: 0,
      transferredOut: 0,
      transferredIn: 0,
    },
    {
      cohort: "Kept appointments",
      active: keptAppointments,
      ltfu: Math.max(0, expectedReview - keptAppointments),
      dead: 0,
      transferredOut: 0,
      transferredIn: 0,
    },
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
      integrationStatus: { integratingYes, integratingNo, orientedYes, services },
      integrationNarrative,
    },
    { headers: NO_STORE },
  )
}
