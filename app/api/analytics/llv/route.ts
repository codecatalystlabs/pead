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

  const [l1, l2, l3, l4] = await Promise.all([
    prisma.submission.aggregate({
      where,
      _sum: {
        L_1_1_No_of_CALHIV_with_llv: true,
        L_1_7_No_who_achieved_supp: true,
        L_1_9_Number_still_w_h_low_level_viraemia: true,
      },
    }),
    prisma.submission.aggregate({ where, _sum: { L_2_1_No_CALHIV_with_llv: true, L_2_7_No_who_achieved_supp: true, L_2_9_Number_still_w_h_low_level_viraemia: true } }),
    prisma.submission.aggregate({ where, _sum: { L_3_1_No_of_CALHIV_with_llv: true, L_3_7_No_who_achieved_supp: true, L_3_9_Number_still_w_h_low_level_viraemia: true } }),
    prisma.submission.aggregate({ where, _sum: { L_4_1_No_of_CALHIV_llv: true, L_4_7_No_who_achieved_supp: true, L_4_9_Number_still_w_h_low_level_viraemia: true } }),
  ])

  const data = [
    { ageGroup: "0 - 4 years", llv: s(l1._sum.L_1_1_No_of_CALHIV_with_llv), suppressed: s(l1._sum.L_1_7_No_who_achieved_supp), stillLLVorHLV: s(l1._sum.L_1_9_Number_still_w_h_low_level_viraemia) },
    { ageGroup: "5 - 9 years", llv: s(l2._sum.L_2_1_No_CALHIV_with_llv), suppressed: s(l2._sum.L_2_7_No_who_achieved_supp), stillLLVorHLV: s(l2._sum.L_2_9_Number_still_w_h_low_level_viraemia) },
    { ageGroup: "10 - 14 years", llv: s(l3._sum.L_3_1_No_of_CALHIV_with_llv), suppressed: s(l3._sum.L_3_7_No_who_achieved_supp), stillLLVorHLV: s(l3._sum.L_3_9_Number_still_w_h_low_level_viraemia) },
    { ageGroup: "15 - 19 years", llv: s(l4._sum.L_4_1_No_of_CALHIV_llv), suppressed: s(l4._sum.L_4_7_No_who_achieved_supp), stillLLVorHLV: s(l4._sum.L_4_9_Number_still_w_h_low_level_viraemia) },
  ]

  return NextResponse.json({ data }, { headers: NO_STORE })
}
