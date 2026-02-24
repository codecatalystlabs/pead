import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const EMPTY_PALD_RESPONSE = {
  weightBandData: [],
  weightBandDataForTransition: [],
  ageBandData: [],
  careModelData: [
    { name: "Mixed OPD", value: 0, patients: 0 },
    { name: "Chronic Care/Clinic Day", value: 0, patients: 0 },
    { name: "Other Models", value: 0, patients: 0 },
  ],
  transitionTrendsData: [{ month: "—", pALD: 0, nonPALD: 0 }],
  totalCalhiv: 0,
  paldOnPald: 0,
  submissionCount: 0,
  noData: true,
  message: "No data for the selected filters or period.",
}

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

    const [
    weightSums,
    ageEligibleSums,
    ageTransitionedSums,
    careModelSums,
    submissionsForTrends,
    totalCalhivAgg,
    paldOnPaldAgg,
    countAgg,
  ] = await Promise.all([
    prisma.submission.aggregate({
      where,
      _sum: {
        calhiv_3_5_9_kg: true,
        calhiv_6_9_9_kg: true,
        calhiv_10_13_9_kg: true,
        calhiv_14_19_9_kg: true,
        calhiv_20_24_9_kg: true,
        calhiv_greater_than_25_kg: true,
        pald_3_5_9_kg: true,
        pald_6_9_9_kg: true,
        pald_10_13_9_kg: true,
        pald_14_19_9_kg: true,
        pald_20_24_9_kg: true,
        C_3_1_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_2_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_3_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_4_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_5_How_many_CLHIV_mg_pALD_formulation: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        B_3_1_Number_CLHIV_0_4_yrs: true,
        B_3_2_How_many_CLHIV_5_9: true,
        B_3_3_How_many_ALHIV_aged_10_1: true,
        B_3_4_No_ALHIV_aged_15_19: true,
        C_3_1_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_2_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_3_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_4_How_many_CLHIV_mg_pALD_formulation: true,
        C_3_5_How_many_CLHIV_mg_pALD_formulation: true,
        C_5_1_How_many_CLHIV_mg_pALD_formulation: true,
        C_5_2_How_many_CLHIV_mg_pALD_formulation: true,
        C_5_3_How_many_ALHIV_mg_pALD_formulation: true,
        C_5_4_How_many_ALHIV_mg_pALD_formulation: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        pald_3_5_9_kg: true,
        pald_6_9_9_kg: true,
        pald_10_13_9_kg: true,
        pald_14_19_9_kg: true,
        pald_20_24_9_kg: true,
        C_5_1_How_many_CLHIV_mg_pALD_formulation: true,
        C_5_2_How_many_CLHIV_mg_pALD_formulation: true,
        C_5_3_How_many_ALHIV_mg_pALD_formulation: true,
        C_5_4_How_many_ALHIV_mg_pALD_formulation: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        number_at_hf_mixed_opd: true,
        number_at_hf_clinic_day: true,
        number_at_hf_other_models: true,
      },
    }),
    prisma.submission.findMany({
      where,
      select: {
        A_5_Reporting_period_quarter: true,
        submissionDate: true,
        total_calhiv_at_hf: true,
        pald_3_5_9_kg: true,
        pald_6_9_9_kg: true,
        pald_10_13_9_kg: true,
        pald_14_19_9_kg: true,
        pald_20_24_9_kg: true,
        C_1_1_How_many_CLHIV_non_pALD_formulation: true,
        C_1_2_How_many_CLHIV_non_pALD_formulation: true,
        C_1_3_How_many_CLHIV_non_pALD_formulation: true,
        C_1_4_How_many_CLHIV_non_pALD_formulation: true,
        C_1_5_How_many_CLHIV_non_pALD_formulation: true,
        C_1_6_How_many_ALHIV_non_pALD_formulation: true,
        C_1_7_How_many_ALHIV_non_pALD_formulation: true,
      },
    }),
    prisma.submission.aggregate({ where, _sum: { total_calhiv_at_hf: true } }),
    prisma.submission.aggregate({
      where,
      _sum: {
        pald_3_5_9_kg: true,
        pald_6_9_9_kg: true,
        pald_10_13_9_kg: true,
        pald_14_19_9_kg: true,
        pald_20_24_9_kg: true,
      },
    }),
    prisma.submission.aggregate({ where, _count: { id: true } }),
  ])

  const s = (v: number | null | undefined) => v ?? 0

  const weightBandData = [
    { band: "3 - 5.9 kg", clhiv: s(weightSums._sum.calhiv_3_5_9_kg), alhiv: 0, eligible: s(weightSums._sum.C_3_1_How_many_CLHIV_mg_pALD_formulation), transitioned: s(weightSums._sum.pald_3_5_9_kg) },
    { band: "6 - 9.9 kg", clhiv: s(weightSums._sum.calhiv_6_9_9_kg), alhiv: 0, eligible: s(weightSums._sum.C_3_2_How_many_CLHIV_mg_pALD_formulation), transitioned: s(weightSums._sum.pald_6_9_9_kg) },
    { band: "10 - 13.9 kg", clhiv: s(weightSums._sum.calhiv_10_13_9_kg), alhiv: 0, eligible: s(weightSums._sum.C_3_3_How_many_CLHIV_mg_pALD_formulation), transitioned: s(weightSums._sum.pald_10_13_9_kg) },
    { band: "14 - 19.9 kg", clhiv: s(weightSums._sum.calhiv_14_19_9_kg), alhiv: 0, eligible: s(weightSums._sum.C_3_4_How_many_CLHIV_mg_pALD_formulation), transitioned: s(weightSums._sum.pald_14_19_9_kg) },
    { band: "20 - 24.9 kg", clhiv: s(weightSums._sum.calhiv_20_24_9_kg), alhiv: 0, eligible: s(weightSums._sum.C_3_5_How_many_CLHIV_mg_pALD_formulation), transitioned: s(weightSums._sum.pald_20_24_9_kg) },
    { band: "≥25 kg", clhiv: 0, alhiv: s(weightSums._sum.calhiv_greater_than_25_kg), eligible: 0, transitioned: 0 },
  ].map((r) => ({
    ...r,
    pct: r.eligible > 0 ? Math.round((r.transitioned / r.eligible) * 1000) / 10 : 0,
  }))

  const paldEligibleAge =
    s(ageEligibleSums._sum.C_3_1_How_many_CLHIV_mg_pALD_formulation) +
    s(ageEligibleSums._sum.C_3_2_How_many_CLHIV_mg_pALD_formulation) +
    s(ageEligibleSums._sum.C_3_3_How_many_CLHIV_mg_pALD_formulation) +
    s(ageEligibleSums._sum.C_3_4_How_many_CLHIV_mg_pALD_formulation) +
    s(ageEligibleSums._sum.C_3_5_How_many_CLHIV_mg_pALD_formulation)
  const paldTransitionedAge =
    s(ageTransitionedSums._sum.pald_3_5_9_kg) +
    s(ageTransitionedSums._sum.pald_6_9_9_kg) +
    s(ageTransitionedSums._sum.pald_10_13_9_kg) +
    s(ageTransitionedSums._sum.pald_14_19_9_kg) +
    s(ageTransitionedSums._sum.pald_20_24_9_kg) +
    s(ageTransitionedSums._sum.C_5_1_How_many_CLHIV_mg_pALD_formulation) +
    s(ageTransitionedSums._sum.C_5_2_How_many_CLHIV_mg_pALD_formulation) +
    s(ageTransitionedSums._sum.C_5_3_How_many_ALHIV_mg_pALD_formulation) +
    s(ageTransitionedSums._sum.C_5_4_How_many_ALHIV_mg_pALD_formulation)
  const eligibleByAge = [
    s(ageEligibleSums._sum.B_3_1_Number_CLHIV_0_4_yrs) + s(ageEligibleSums._sum.C_3_1_How_many_CLHIV_mg_pALD_formulation) + s(ageEligibleSums._sum.C_3_2_How_many_CLHIV_mg_pALD_formulation),
    s(ageEligibleSums._sum.B_3_2_How_many_CLHIV_5_9),
    s(ageEligibleSums._sum.B_3_3_How_many_ALHIV_aged_10_1),
    s(ageEligibleSums._sum.B_3_4_No_ALHIV_aged_15_19),
  ]
  const ageBandData = [
    { age: "< 5 years", eligible: eligibleByAge[0], transitioned: s(ageTransitionedSums._sum.pald_3_5_9_kg) + s(ageTransitionedSums._sum.pald_6_9_9_kg), pct: eligibleByAge[0] > 0 ? Math.round((s(ageTransitionedSums._sum.pald_3_5_9_kg) + s(ageTransitionedSums._sum.pald_6_9_9_kg)) / eligibleByAge[0] * 1000) / 10 : 0 },
    { age: "5 - 9 years", eligible: eligibleByAge[1], transitioned: s(ageTransitionedSums._sum.pald_10_13_9_kg), pct: eligibleByAge[1] > 0 ? Math.round(s(ageTransitionedSums._sum.pald_10_13_9_kg) / eligibleByAge[1] * 1000) / 10 : 0 },
    { age: "10 - 14 years", eligible: eligibleByAge[2], transitioned: s(ageTransitionedSums._sum.pald_14_19_9_kg) + s(ageTransitionedSums._sum.C_5_3_How_many_ALHIV_mg_pALD_formulation), pct: eligibleByAge[2] > 0 ? Math.round((s(ageTransitionedSums._sum.pald_14_19_9_kg) + s(ageTransitionedSums._sum.C_5_3_How_many_ALHIV_mg_pALD_formulation)) / eligibleByAge[2] * 1000) / 10 : 0 },
    { age: "15 - 19 years", eligible: eligibleByAge[3], transitioned: s(ageTransitionedSums._sum.C_5_4_How_many_ALHIV_mg_pALD_formulation), pct: eligibleByAge[3] > 0 ? Math.round(s(ageTransitionedSums._sum.C_5_4_How_many_ALHIV_mg_pALD_formulation) / eligibleByAge[3] * 1000) / 10 : 0 },
  ]

  const mixed = s(careModelSums._sum.number_at_hf_mixed_opd)
  const chronic = s(careModelSums._sum.number_at_hf_clinic_day)
  const other = s(careModelSums._sum.number_at_hf_other_models)
  const totalCare = mixed + chronic + other
  const careModelData = [
    { name: "Mixed OPD", value: totalCare > 0 ? Math.round((mixed / totalCare) * 100) : 0, patients: mixed },
    { name: "Chronic Care/Clinic Day", value: totalCare > 0 ? Math.round((chronic / totalCare) * 100) : 0, patients: chronic },
    { name: "Other Models", value: totalCare > 0 ? Math.round((other / totalCare) * 100) : 0, patients: other },
  ]

  const periodMap = new Map<string, { pald: number; nonPald: number }>()
  for (const sub of submissionsForTrends) {
    const period = sub.A_5_Reporting_period_quarter ?? (sub.submissionDate ? new Date(sub.submissionDate).toISOString().slice(0, 7) : "Other")
    const pald =
      s(sub.pald_3_5_9_kg) + s(sub.pald_6_9_9_kg) + s(sub.pald_10_13_9_kg) + s(sub.pald_14_19_9_kg) + s(sub.pald_20_24_9_kg)
    const nonPald =
      s(sub.C_1_1_How_many_CLHIV_non_pALD_formulation) +
      s(sub.C_1_2_How_many_CLHIV_non_pALD_formulation) +
      s(sub.C_1_3_How_many_CLHIV_non_pALD_formulation) +
      s(sub.C_1_4_How_many_CLHIV_non_pALD_formulation) +
      s(sub.C_1_5_How_many_CLHIV_non_pALD_formulation) +
      s(sub.C_1_6_How_many_ALHIV_non_pALD_formulation) +
      s(sub.C_1_7_How_many_ALHIV_non_pALD_formulation)
    const cur = periodMap.get(period) ?? { pald: 0, nonPald: 0 }
    periodMap.set(period, { pald: cur.pald + pald, nonPald: cur.nonPald + nonPald })
  }
  const transitionTrendsData = Array.from(periodMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([period, v]) => {
      const tot = v.pald + v.nonPald
      return {
        month: period.length === 7 ? period.slice(5) + "/" + period.slice(2, 4) : period,
        pALD: tot > 0 ? Math.round((v.pald / tot) * 100) : 0,
        nonPALD: tot > 0 ? Math.round((v.nonPald / tot) * 100) : 0,
      }
    })
  if (transitionTrendsData.length === 0) {
    transitionTrendsData.push({ month: "—", pALD: 0, nonPALD: 0 })
  }

  const weightBandDataForTransition = weightBandData
    .filter((r) => r.eligible > 0 || r.transitioned > 0)
    .map(({ band, eligible, transitioned, pct }) => ({ band, eligible, transitioned, pct }))

  const totalCalhiv = totalCalhivAgg._sum.total_calhiv_at_hf ?? 0
  const paldOnPald =
    (paldOnPaldAgg._sum.pald_3_5_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_6_9_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_10_13_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_14_19_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_20_24_9_kg ?? 0)
  const submissionCount = countAgg._count.id ?? 0

  return NextResponse.json(
      {
        weightBandData,
        weightBandDataForTransition,
        ageBandData,
        careModelData,
        transitionTrendsData,
        totalCalhiv,
        paldOnPald,
        submissionCount,
      },
      { headers: NO_STORE },
    )
  } catch {
    return NextResponse.json(
      { ...EMPTY_PALD_RESPONSE },
      { status: 200, headers: NO_STORE },
    )
  }
}
