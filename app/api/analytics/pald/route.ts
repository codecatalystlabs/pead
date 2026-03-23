import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

type SubmissionForAnalysis = {
  facility: string | null
  A_5_Reporting_period_quarter: string | null
  submissionDate: Date | null
  total_calhiv_at_hf: number | null
  calhiv_3_5_9_kg: number | null
  calhiv_6_9_9_kg: number | null
  calhiv_10_13_9_kg: number | null
  calhiv_14_19_9_kg: number | null
  calhiv_20_24_9_kg: number | null
  calhiv_greater_than_25_kg: number | null
  pald_3_5_9_kg: number | null
  pald_6_9_9_kg: number | null
  pald_10_13_9_kg: number | null
  pald_14_19_9_kg: number | null
  pald_20_24_9_kg: number | null
  C_1_1_How_many_CLHIV_non_pALD_formulation: number | null
  C_1_2_How_many_CLHIV_non_pALD_formulation: number | null
  C_1_3_How_many_CLHIV_non_pALD_formulation: number | null
  C_1_4_How_many_CLHIV_non_pALD_formulation: number | null
  C_1_5_How_many_CLHIV_non_pALD_formulation: number | null
  C_1_6_How_many_ALHIV_non_pALD_formulation: number | null
  C_1_7_How_many_ALHIV_non_pALD_formulation: number | null
  C_3_1_How_many_CLHIV_mg_pALD_formulation: number | null
  C_3_2_How_many_CLHIV_mg_pALD_formulation: number | null
  C_3_3_How_many_CLHIV_mg_pALD_formulation: number | null
  C_3_4_How_many_CLHIV_mg_pALD_formulation: number | null
  C_3_5_How_many_CLHIV_mg_pALD_formulation: number | null
  B_3_1_Number_CLHIV_0_4_yrs: number | null
  B_3_2_How_many_CLHIV_5_9: number | null
  B_3_3_How_many_ALHIV_aged_10_1: number | null
  B_3_4_No_ALHIV_aged_15_19: number | null
  C_5_1_How_many_CLHIV_mg_pALD_formulation: number | null
  C_5_2_How_many_CLHIV_mg_pALD_formulation: number | null
  C_5_3_How_many_ALHIV_mg_pALD_formulation: number | null
  C_5_4_How_many_ALHIV_mg_pALD_formulation: number | null
  number_at_hf_mixed_opd: number | null
  number_at_hf_clinic_day: number | null
  number_at_hf_other_models: number | null
}

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
  dataQualityWarnings: [],
  dataQualitySummary: null,
  noData: true,
  message: "No data for the selected filters or period.",
}

function s(v: number | null | undefined) {
  return v ?? 0
}

function buildSubmissionIssues(sub: SubmissionForAnalysis): string[] {
  const totalCalhiv = s(sub.total_calhiv_at_hf)
  const totalByWeight =
    s(sub.calhiv_3_5_9_kg) +
    s(sub.calhiv_6_9_9_kg) +
    s(sub.calhiv_10_13_9_kg) +
    s(sub.calhiv_14_19_9_kg) +
    s(sub.calhiv_20_24_9_kg) +
    s(sub.calhiv_greater_than_25_kg)
  const totalByAge =
    s(sub.B_3_1_Number_CLHIV_0_4_yrs) +
    s(sub.B_3_2_How_many_CLHIV_5_9) +
    s(sub.B_3_3_How_many_ALHIV_aged_10_1) +
    s(sub.B_3_4_No_ALHIV_aged_15_19)
  const paldEligibleByWeight =
    s(sub.C_3_1_How_many_CLHIV_mg_pALD_formulation) +
    s(sub.C_3_2_How_many_CLHIV_mg_pALD_formulation) +
    s(sub.C_3_3_How_many_CLHIV_mg_pALD_formulation) +
    s(sub.C_3_4_How_many_CLHIV_mg_pALD_formulation) +
    s(sub.C_3_5_How_many_CLHIV_mg_pALD_formulation)
  const paldOnPaldByWeight =
    s(sub.pald_3_5_9_kg) +
    s(sub.pald_6_9_9_kg) +
    s(sub.pald_10_13_9_kg) +
    s(sub.pald_14_19_9_kg) +
    s(sub.pald_20_24_9_kg)
  const paldOnPaldByAge =
    s(sub.C_5_1_How_many_CLHIV_mg_pALD_formulation) +
    s(sub.C_5_2_How_many_CLHIV_mg_pALD_formulation) +
    s(sub.C_5_3_How_many_ALHIV_mg_pALD_formulation) +
    s(sub.C_5_4_How_many_ALHIV_mg_pALD_formulation)
  const totalInCareModels =
    s(sub.number_at_hf_mixed_opd) +
    s(sub.number_at_hf_clinic_day) +
    s(sub.number_at_hf_other_models)

  const issues: string[] = []

  if (totalCalhiv > 0 && totalCalhiv !== totalByAge) {
    issues.push(`age-band total ${totalByAge.toLocaleString()} vs reported total ${totalCalhiv.toLocaleString()}`)
  }
  if (totalCalhiv > 0 && totalCalhiv !== totalByWeight) {
    issues.push(`weight-band total ${totalByWeight.toLocaleString()} vs reported total ${totalCalhiv.toLocaleString()}`)
  }
  if (paldOnPaldByWeight > paldEligibleByWeight) {
    issues.push(`on pALD ${paldOnPaldByWeight.toLocaleString()} exceeds weight-band eligible ${paldEligibleByWeight.toLocaleString()}`)
  }
  if ((paldOnPaldByAge > 0 || paldOnPaldByWeight > 0) && paldOnPaldByAge !== paldOnPaldByWeight) {
    issues.push(`age-band on pALD ${paldOnPaldByAge.toLocaleString()} vs weight-band on pALD ${paldOnPaldByWeight.toLocaleString()}`)
  }
  if (totalCalhiv > 0 && totalInCareModels > 0 && totalCalhiv !== totalInCareModels) {
    issues.push(`care-model total ${totalInCareModels.toLocaleString()} vs reported total ${totalCalhiv.toLocaleString()}`)
  }

  return issues
}

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

    const [
      weightSums,
      ageSectionSums,
      careModelSums,
      submissionsForAnalysis,
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
          facility: true,
          A_5_Reporting_period_quarter: true,
          submissionDate: true,
          total_calhiv_at_hf: true,
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
          C_1_1_How_many_CLHIV_non_pALD_formulation: true,
          C_1_2_How_many_CLHIV_non_pALD_formulation: true,
          C_1_3_How_many_CLHIV_non_pALD_formulation: true,
          C_1_4_How_many_CLHIV_non_pALD_formulation: true,
          C_1_5_How_many_CLHIV_non_pALD_formulation: true,
          C_1_6_How_many_ALHIV_non_pALD_formulation: true,
          C_1_7_How_many_ALHIV_non_pALD_formulation: true,
          C_3_1_How_many_CLHIV_mg_pALD_formulation: true,
          C_3_2_How_many_CLHIV_mg_pALD_formulation: true,
          C_3_3_How_many_CLHIV_mg_pALD_formulation: true,
          C_3_4_How_many_CLHIV_mg_pALD_formulation: true,
          C_3_5_How_many_CLHIV_mg_pALD_formulation: true,
          B_3_1_Number_CLHIV_0_4_yrs: true,
          B_3_2_How_many_CLHIV_5_9: true,
          B_3_3_How_many_ALHIV_aged_10_1: true,
          B_3_4_No_ALHIV_aged_15_19: true,
          C_5_1_How_many_CLHIV_mg_pALD_formulation: true,
          C_5_2_How_many_CLHIV_mg_pALD_formulation: true,
          C_5_3_How_many_ALHIV_mg_pALD_formulation: true,
          C_5_4_How_many_ALHIV_mg_pALD_formulation: true,
          number_at_hf_mixed_opd: true,
          number_at_hf_clinic_day: true,
          number_at_hf_other_models: true,
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

  const ageBandData = [
    {
      age: "0 - 4 years",
      inCare: s(ageSectionSums._sum.B_3_1_Number_CLHIV_0_4_yrs),
      onPald: s(ageSectionSums._sum.C_5_1_How_many_CLHIV_mg_pALD_formulation),
    },
    {
      age: "5 - 9 years",
      inCare: s(ageSectionSums._sum.B_3_2_How_many_CLHIV_5_9),
      onPald: s(ageSectionSums._sum.C_5_2_How_many_CLHIV_mg_pALD_formulation),
    },
    {
      age: "10 - 14 years",
      inCare: s(ageSectionSums._sum.B_3_3_How_many_ALHIV_aged_10_1),
      onPald: s(ageSectionSums._sum.C_5_3_How_many_ALHIV_mg_pALD_formulation),
    },
    {
      age: "15 - 19 years",
      inCare: s(ageSectionSums._sum.B_3_4_No_ALHIV_aged_15_19),
      onPald: s(ageSectionSums._sum.C_5_4_How_many_ALHIV_mg_pALD_formulation),
    },
  ].map((row) => ({
    ...row,
    pct: row.inCare > 0 ? Math.round((row.onPald / row.inCare) * 1000) / 10 : 0,
  }))

  const totalCalhiv = totalCalhivAgg._sum.total_calhiv_at_hf ?? 0
  const totalCalhivFromAgeBands = ageBandData.reduce((sum, row) => sum + row.inCare, 0)
  const totalCalhivFromWeightBands = weightBandData.reduce((sum, row) => sum + row.clhiv + row.alhiv, 0)
  const paldOnPaldByAge = ageBandData.reduce((sum, row) => sum + row.onPald, 0)
  const paldEligibleByWeight = weightBandData.reduce((sum, row) => sum + row.eligible, 0)

  const paldOnPald =
    (paldOnPaldAgg._sum.pald_3_5_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_6_9_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_10_13_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_14_19_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_20_24_9_kg ?? 0)

  const mixed = s(careModelSums._sum.number_at_hf_mixed_opd)
  const chronic = s(careModelSums._sum.number_at_hf_clinic_day)
  const other = s(careModelSums._sum.number_at_hf_other_models)
  const totalCare = mixed + chronic + other
  const careModelData = [
    { name: "Mixed OPD", value: totalCare > 0 ? Math.round((mixed / totalCare) * 100) : 0, patients: mixed },
    { name: "Chronic Care/Clinic Day", value: totalCare > 0 ? Math.round((chronic / totalCare) * 100) : 0, patients: chronic },
    { name: "Other Models", value: totalCare > 0 ? Math.round((other / totalCare) * 100) : 0, patients: other },
  ]

  const submissionCount = countAgg._count.id ?? 0
  const submissionIssues = submissionsForAnalysis
    .map((sub) => {
      const issues = buildSubmissionIssues(sub)
      return issues.length > 0
        ? { facility: sub.facility ?? "Unknown facility", issues }
        : null
    })
    .filter((row): row is { facility: string; issues: string[] } => row != null)

  const dataQualityWarnings: string[] = []
  if (totalCalhiv > 0 && totalCalhiv !== totalCalhivFromAgeBands) {
    dataQualityWarnings.push(
      `Reported total CALHIV is ${totalCalhiv.toLocaleString()}, but age-band totals sum to ${totalCalhivFromAgeBands.toLocaleString()}.`,
    )
  }
  if (totalCalhiv > 0 && totalCalhiv !== totalCalhivFromWeightBands) {
    dataQualityWarnings.push(
      `Reported total CALHIV is ${totalCalhiv.toLocaleString()}, but weight-band totals sum to ${totalCalhivFromWeightBands.toLocaleString()}.`,
    )
  }
  if (paldOnPald > paldEligibleByWeight) {
    dataQualityWarnings.push(
      `Reported on pALD is ${paldOnPald.toLocaleString()}, which exceeds weight-band eligible counts of ${paldEligibleByWeight.toLocaleString()}.`,
    )
  }
  if ((paldOnPaldByAge > 0 || paldOnPald > 0) && paldOnPaldByAge !== paldOnPald) {
    dataQualityWarnings.push(
      `Age-band on-pALD totals sum to ${paldOnPaldByAge.toLocaleString()}, while weight-band on-pALD totals sum to ${paldOnPald.toLocaleString()}.`,
    )
  }
  if (totalCare > 0 && totalCalhiv > 0 && totalCare !== totalCalhiv) {
    dataQualityWarnings.push(
      `Care-model totals sum to ${totalCare.toLocaleString()}, which does not match reported total CALHIV of ${totalCalhiv.toLocaleString()}.`,
    )
  }
  if (submissionIssues.length > 0) {
    dataQualityWarnings.push(
      `${submissionIssues.length} of ${submissionCount} selected submissions have at least one section mismatch.`,
    )
  }

  const dataQualitySummary = submissionCount > 0
    ? {
        totalCalhivFromAgeBands,
        totalCalhivFromWeightBands,
        paldEligibleByWeight,
        paldOnPaldByAge,
        paldOnPaldByWeight: paldOnPald,
        careModelPatients: totalCare,
        inconsistentSubmissionCount: submissionIssues.length,
        affectedFacilities: submissionIssues.map((row) => row.facility),
      }
    : null

  const periodMap = new Map<string, { pald: number; nonPald: number }>()
  for (const sub of submissionsForAnalysis) {
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
        dataQualityWarnings,
        dataQualitySummary,
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
