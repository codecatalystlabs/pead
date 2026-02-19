import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"

const s = (v: number | null | undefined) => v ?? 0

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const [k1, k2, k3, k4] = await Promise.all([
    prisma.submission.aggregate({
      where,
      _sum: {
        K_1_1_No_clhiv_hlv_0_4: true,
        K_1_2_Number_who_com_high_level_viraemia: true,
        K_1_3_Number_who_com_high_level_viraemia: true,
        K_1_4_Number_who_com_high_level_viraemia: true,
        K_1_5_No_comp_3iac_0_4: true,
        K_1_6_No_comp_4iac_0_4: true,
        K_1_8_No_viral_supp_3iac_0_4: true,
        K_1_10_Number_still_high_level_viraemia: true,
        K_1_11_Number_referr_high_level_viraemia: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        K_2_1_No_CALHIV_with_hlv: true,
        K_2_2_Number_who_com_high_level_viraemia: true,
        K_2_3_Number_who_com_high_level_viraemia: true,
        K_2_4_Number_who_com_high_level_viraemia: true,
        K_2_5_No_completed_3_iac_5_9: true,
        K_2_6_No_completed_4_iac_5_9: true,
        K_2_8_Number_who_ach_high_level_viraemia: true,
        K_2_10_Number_still_high_level_viraemia: true,
        K_2_11_Number_referr_high_level_viraemia: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        K_3_1_No_of_CLHIV_hlv: true,
        K_3_2_Number_who_com_high_level_viraemia: true,
        K_3_3_Number_who_com_high_level_viraemia: true,
        K_3_4_Number_who_com_high_level_viraemia: true,
        K_3_5_No_completed_3_iac_10_14: true,
        K_3_6_No_completed_4_iac_10_14: true,
        K_3_8_No_achieved_supp_3_more: true,
        K_3_10_Number_still_high_level_viraemia: true,
        K_3_11_Number_referr_high_level_viraemia: true,
      },
    }),
    prisma.submission.aggregate({
      where,
      _sum: {
        K_4_1_No_of_CALHIV_hlv: true,
        K_4_2_Number_who_com_high_level_viraemia: true,
        K_4_3_Number_who_com_high_level_viraemia: true,
        K_4_4_Number_who_com_high_level_viraemia: true,
        K_4_5_No_completed_3_iac: true,
        K_4_6_No_completed_4_iac: true,
        K_4_8_No_achieved_supp: true,
        K_4_10_Number_still_high_level_viraemia: true,
        K_4_11_Number_referr_high_level_viraemia: true,
      },
    }),
  ])

  const data = [
    { ageGroup: "0 - 4 years", hlv: s(k1._sum.K_1_1_No_clhiv_hlv_0_4), iac0: 0, iac1: 0, iac2: 0, iac3: s(k1._sum.K_1_5_No_comp_3iac_0_4), iac4Plus: s(k1._sum.K_1_6_No_comp_4iac_0_4), suppressed: s(k1._sum.K_1_8_No_viral_supp_3iac_0_4), unsuppressed: s(k1._sum.K_1_10_Number_still_high_level_viraemia), drReferred: s(k1._sum.K_1_11_Number_referr_high_level_viraemia) },
    { ageGroup: "5 - 9 years", hlv: s(k2._sum.K_2_1_No_CALHIV_with_hlv), iac0: 0, iac1: 0, iac2: 0, iac3: s(k2._sum.K_2_5_No_completed_3_iac_5_9), iac4Plus: s(k2._sum.K_2_6_No_completed_4_iac_5_9), suppressed: s(k2._sum.K_2_8_Number_who_ach_high_level_viraemia), unsuppressed: s(k2._sum.K_2_10_Number_still_high_level_viraemia), drReferred: s(k2._sum.K_2_11_Number_referr_high_level_viraemia) },
    { ageGroup: "10 - 14 years", hlv: s(k3._sum.K_3_1_No_of_CLHIV_hlv), iac0: 0, iac1: 0, iac2: 0, iac3: s(k3._sum.K_3_5_No_completed_3_iac_10_14), iac4Plus: s(k3._sum.K_3_6_No_completed_4_iac_10_14), suppressed: s(k3._sum.K_3_8_No_achieved_supp_3_more), unsuppressed: s(k3._sum.K_3_10_Number_still_high_level_viraemia), drReferred: s(k3._sum.K_3_11_Number_referr_high_level_viraemia) },
    { ageGroup: "15 - 19 years", hlv: s(k4._sum.K_4_1_No_of_CALHIV_hlv), iac0: 0, iac1: 0, iac2: 0, iac3: s(k4._sum.K_4_5_No_completed_3_iac), iac4Plus: s(k4._sum.K_4_6_No_completed_4_iac), suppressed: s(k4._sum.K_4_8_No_achieved_supp), unsuppressed: s(k4._sum.K_4_10_Number_still_high_level_viraemia), drReferred: s(k4._sum.K_4_11_Number_referr_high_level_viraemia) },
  ]

  return NextResponse.json({ data })
}
