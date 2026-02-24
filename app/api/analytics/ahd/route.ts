import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const s = (v: number | null | undefined) => v ?? 0

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const [h1, h2, h3, h4] = await Promise.all([
    prisma.submission.aggregate({
      where,
      _sum: {
        H_1_4_How_many_CLHIV_g_during_this_period: true,
        H_1_5_How_many_CLHIV_iven_as_a_percentage: true,
        H_1_6_How_many_had_C_ercentage_CD4_cutoff: true,
        H_1_7_How_many_were_TB_LAM_and_GeneXpert: true,
        H_1_8_How_many_teste_TBLAM_and_GeneXpert: true,
        H_1_9_How_many_of_th_ed_anti_TB_treatment: true,
        H_1_13_How_many_were_nutrition_using_MUAC: true,
        H_1_14_How_many_were_malnourished: true,
        H_1_15_How_many_maln_ion_for_malnutrition: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        H_2_4_How_many_CLHIV_g_during_this_period: true,
        H_2_5_How_many_CLHIV_had_a_CD4_test_done: true,
        H_2_6_How_many_CLHIV_ad_CD4_200_cells_L: true,
        H_2_7_How_many_were_TB_LAM_and_GeneXpert: true,
        H_2_8_How_many_teste_TBLAM_and_GeneXpert: true,
        H_2_9_How_many_of_th_ed_anti_TB_treatment: true,
        H_2_13_How_many_were_nutrition_using_MUAC: true,
        H_2_14_How_many_were_malnourished: true,
        H_2_15_How_many_maln_ion_for_malnutrition: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        H_3_4_How_many_ALHIV_creening_this_period: true,
        H_3_5_How_many_ALHIV_had_a_CD4_test_done: true,
        H_3_6_How_many_ALHIV_ad_CD4_200_cells_L: true,
        H_3_7_How_many_were_TB_LAM_and_GeneXpert: true,
        H_3_16_How_many_rece_test_10_years_only: true,
        H_3_17_Of_those_who_many_tested_positive: true,
        H_3_18_Of_those_who_ot_a_lumbar_puncture: true,
        H_3_19_Of_those_who_a_negative_CSF_CRAG: true,
        H_3_20_Of_those_who_re_emptive_treatment: true,
        H_3_25_Of_those_who_a_positive_CSF_CRAG: true,
        H_3_26_Of_those_who_gitis_CM_treatment: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        H_4_4_How_many_ALHIV_creening_this_period: true,
        H_4_5_How_many_ALHIV_had_a_CD4_test_done: true,
        H_4_6_How_many_ALHIV_ad_CD4_200_cells_L: true,
        H_4_7_How_many_were_TB_LAM_and_GeneXpert: true,
        H_4_16_How_many_rece_test_10_years_only: true,
        H_4_17_Of_those_who_any_tested_positive_: true,
        H_4_25_Of_those_who_a_positive_CSF_CRAG: true,
        H_4_26_Of_those_who_gitis_CM_treatment: true,
      },
    }),
  ])

  const data = [
    { ageGroup: "0 - 4 years", screened: s(h1._sum.H_1_4_How_many_CLHIV_g_during_this_period), cd4: s(h1._sum.H_1_6_How_many_had_C_ercentage_CD4_cutoff), tb: s(h1._sum.H_1_7_How_many_were_TB_LAM_and_GeneXpert), malnutrition: s(h1._sum.H_1_14_How_many_were_malnourished), crag: null as number | null },
    { ageGroup: "5 - 9 years", screened: s(h2._sum.H_2_4_How_many_CLHIV_g_during_this_period), cd4: s(h2._sum.H_2_6_How_many_CLHIV_ad_CD4_200_cells_L), tb: s(h2._sum.H_2_7_How_many_were_TB_LAM_and_GeneXpert), malnutrition: s(h2._sum.H_2_14_How_many_were_malnourished), crag: null as number | null },
    { ageGroup: "10 - 14 years", screened: s(h3._sum.H_3_4_How_many_ALHIV_creening_this_period), cd4: s(h3._sum.H_3_6_How_many_ALHIV_ad_CD4_200_cells_L), tb: s(h3._sum.H_3_7_How_many_were_TB_LAM_and_GeneXpert), malnutrition: 0, crag: s(h3._sum.H_3_16_How_many_rece_test_10_years_only) + s(h3._sum.H_3_17_Of_those_who_many_tested_positive) },
    { ageGroup: "15 - 19 years", screened: s(h4._sum.H_4_4_How_many_ALHIV_creening_this_period), cd4: s(h4._sum.H_4_6_How_many_ALHIV_ad_CD4_200_cells_L), tb: s(h4._sum.H_4_7_How_many_were_TB_LAM_and_GeneXpert), malnutrition: 0, crag: s(h4._sum.H_4_16_How_many_rece_test_10_years_only) + s(h4._sum.H_4_17_Of_those_who_any_tested_positive_) },
  ]

  return NextResponse.json({ data }, { headers: NO_STORE })
}
