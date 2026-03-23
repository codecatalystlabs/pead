import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters, parseFilterParams } from "@/lib/analyticsFilters"
import { filterRowsByAgeBand } from "@/lib/ageBand"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const s = (v: number | null | undefined) => v ?? 0

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const [l1, l2, l3, l4] = await Promise.all([
    prisma.submission.aggregate({
      where,
      _sum: {
        L_1_1_No_of_CALHIV_with_llv: true,
        L_1_2_Number_who_com_h_low_level_viraemia: true,
        L_1_3_Number_who_com_h_low_level_viraemia: true,
        L_1_4_Number_who_com_h_low_level_viraemia: true,
        L_1_5_Number_who_com_h_low_level_viraemia: true,
        L_1_6_Number_who_com_h_low_level_viraemia: true,
        L_1_7_No_who_achieved_supp: true,
        L_1_9_Number_still_w_h_low_level_viraemia: true,
      },
    }),
    prisma.submission.aggregate({ where, _sum: { L_2_1_No_CALHIV_with_llv: true, L_2_2_Number_who_com_h_low_level_viraemia: true, L_2_3_Number_who_com_h_low_level_viraemia: true, L_2_4_Number_who_com_h_low_level_viraemia: true, L_2_5_Number_who_com_h_low_level_viraemia: true, L_2_6_Number_who_com_h_low_level_viraemia: true, L_2_7_No_who_achieved_supp: true, L_2_9_Number_still_w_h_low_level_viraemia: true } }),
    prisma.submission.aggregate({ where, _sum: { L_3_1_No_of_CALHIV_with_llv: true, L_3_2_Number_who_com_h_low_level_viraemia: true, L_3_3_Number_who_com_h_low_level_viraemia: true, L_3_4_Number_who_com_h_low_level_viraemia: true, L_3_5_Number_who_com_h_low_level_viraemia: true, L_3_6_Number_who_com_h_low_level_viraemia: true, L_3_7_No_who_achieved_supp: true, L_3_9_Number_still_w_h_low_level_viraemia: true } }),
    prisma.submission.aggregate({ where, _sum: { L_4_1_No_of_CALHIV_llv: true, L_4_2_Number_who_com_h_low_level_viraemia: true, L_4_3_Number_who_com_h_low_level_viraemia: true, L_4_4_Number_who_com_h_low_level_viraemia: true, L_4_5_Number_who_com_h_low_level_viraemia: true, L_4_6_Number_who_com_h_low_level_viraemia: true, L_4_7_No_who_achieved_supp: true, L_4_9_Number_still_w_h_low_level_viraemia: true } }),
  ])

  const params = parseFilterParams(req.url)
  const data = filterRowsByAgeBand([
    { ageGroup: "0 - 4 years", llv: s(l1._sum.L_1_1_No_of_CALHIV_with_llv), iac1: s(l1._sum.L_1_2_Number_who_com_h_low_level_viraemia), iac2: s(l1._sum.L_1_3_Number_who_com_h_low_level_viraemia), iac3: s(l1._sum.L_1_4_Number_who_com_h_low_level_viraemia), iac4Plus: s(l1._sum.L_1_5_Number_who_com_h_low_level_viraemia), repeatViralLoad: s(l1._sum.L_1_6_Number_who_com_h_low_level_viraemia), suppressed: s(l1._sum.L_1_7_No_who_achieved_supp), stillLLVorHLV: s(l1._sum.L_1_9_Number_still_w_h_low_level_viraemia) },
    { ageGroup: "5 - 9 years", llv: s(l2._sum.L_2_1_No_CALHIV_with_llv), iac1: s(l2._sum.L_2_2_Number_who_com_h_low_level_viraemia), iac2: s(l2._sum.L_2_3_Number_who_com_h_low_level_viraemia), iac3: s(l2._sum.L_2_4_Number_who_com_h_low_level_viraemia), iac4Plus: s(l2._sum.L_2_5_Number_who_com_h_low_level_viraemia), repeatViralLoad: s(l2._sum.L_2_6_Number_who_com_h_low_level_viraemia), suppressed: s(l2._sum.L_2_7_No_who_achieved_supp), stillLLVorHLV: s(l2._sum.L_2_9_Number_still_w_h_low_level_viraemia) },
    { ageGroup: "10 - 14 years", llv: s(l3._sum.L_3_1_No_of_CALHIV_with_llv), iac1: s(l3._sum.L_3_2_Number_who_com_h_low_level_viraemia), iac2: s(l3._sum.L_3_3_Number_who_com_h_low_level_viraemia), iac3: s(l3._sum.L_3_4_Number_who_com_h_low_level_viraemia), iac4Plus: s(l3._sum.L_3_5_Number_who_com_h_low_level_viraemia), repeatViralLoad: s(l3._sum.L_3_6_Number_who_com_h_low_level_viraemia), suppressed: s(l3._sum.L_3_7_No_who_achieved_supp), stillLLVorHLV: s(l3._sum.L_3_9_Number_still_w_h_low_level_viraemia) },
    { ageGroup: "15 - 19 years", llv: s(l4._sum.L_4_1_No_of_CALHIV_llv), iac1: s(l4._sum.L_4_2_Number_who_com_h_low_level_viraemia), iac2: s(l4._sum.L_4_3_Number_who_com_h_low_level_viraemia), iac3: s(l4._sum.L_4_4_Number_who_com_h_low_level_viraemia), iac4Plus: s(l4._sum.L_4_5_Number_who_com_h_low_level_viraemia), repeatViralLoad: s(l4._sum.L_4_6_Number_who_com_h_low_level_viraemia), suppressed: s(l4._sum.L_4_7_No_who_achieved_supp), stillLLVorHLV: s(l4._sum.L_4_9_Number_still_w_h_low_level_viraemia) },
  ], params.ageBand)

  return NextResponse.json({ data }, { headers: NO_STORE })
}
