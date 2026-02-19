import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  // Basic aggregates – you can refine formulas as needed
  const [
    totalCalhivAgg,
    vlSuppressedAgg,
    totalVlEligibleAgg,
    paldEligibleAgg,
    paldOnPaldAgg,
    trainedHwAgg,
    totalHwAgg,
  ] = await Promise.all([
    prisma.submission.aggregate({
      where,
      _sum: { total_calhiv_at_hf: true },
    }),
    prisma.submission.aggregate({
      where,
      _sum: { J_5_4_Tt_no_of_CALHIV_supp: true },
    }),
    prisma.submission.aggregate({
      where,
      _sum: { J_5_1_tt_no_updated_vl_all: true },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
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
        pald_3_5_9_kg: true,
        pald_6_9_9_kg: true,
        pald_10_13_9_kg: true,
        pald_14_19_9_kg: true,
        pald_20_24_9_kg: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: { number_hw_trained_integra: true },
    }),
    prisma.submission.aggregate({
      where,
      _sum: { total_number_hw_at_site: true },
    }),
  ])

  const totalCalhiv = totalCalhivAgg._sum.total_calhiv_at_hf ?? 0
  const vlSuppressed = vlSuppressedAgg._sum.J_5_4_Tt_no_of_CALHIV_supp ?? 0
  const totalVlEligible = totalVlEligibleAgg._sum.J_5_1_tt_no_updated_vl_all ?? 0

  const paldEligible =
    (paldEligibleAgg._sum.C_3_1_How_many_CLHIV_mg_pALD_formulation ?? 0) +
    (paldEligibleAgg._sum.C_3_2_How_many_CLHIV_mg_pALD_formulation ?? 0) +
    (paldEligibleAgg._sum.C_3_3_How_many_CLHIV_mg_pALD_formulation ?? 0) +
    (paldEligibleAgg._sum.C_3_4_How_many_CLHIV_mg_pALD_formulation ?? 0) +
    (paldEligibleAgg._sum.C_3_5_How_many_CLHIV_mg_pALD_formulation ?? 0)

  const paldOnPald =
    (paldOnPaldAgg._sum.pald_3_5_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_6_9_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_10_13_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_14_19_9_kg ?? 0) +
    (paldOnPaldAgg._sum.pald_20_24_9_kg ?? 0)

  const trainedHw = trainedHwAgg._sum.number_hw_trained_integra ?? 0
  const totalHw = totalHwAgg._sum.total_number_hw_at_site ?? 0

  const careIntegrationRate = totalCalhiv > 0 ? (paldEligible / totalCalhiv) * 100 : 0
  const paldTransitionRate = paldEligible > 0 ? (paldOnPald / paldEligible) * 100 : 0
  const staffTrainingCoverage = totalHw > 0 ? (trainedHw / totalHw) * 100 : 0
  const vlSuppressionRate = totalVlEligible > 0 ? (vlSuppressed / totalVlEligible) * 100 : 0

  return NextResponse.json(
    {
      totalCalhiv,
      careIntegrationRate,
      paldTransitionRate,
      staffTrainingCoverage,
      vlSuppressionRate,
      vlSuppressed,
      totalVlEligible,
      paldEligible,
      paldOnPald,
      trainedHw,
      totalHw,
    },
    { status: 200 },
  )
}

