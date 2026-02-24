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

  const [j1, j2, j3, j4, j5] = await Promise.all([
    prisma.submission.aggregate({ where, _sum: { J_1_1_Number_of_children_updat: true, J_1_3_Number_of_chil_al_Load_0_4_years: true, J_1_4_Number_of_children_supp: true } }),
    prisma.submission.aggregate({ where, _sum: { J_2_1_Number_child_updated_vl: true, J_2_3_Number_of_chil_al_Load_5_9_years: true, J_2_4_Number_child_supp_vl: true } }),
    prisma.submission.aggregate({ where, _sum: { J_3_1_Number_of_children_updat: true, J_3_3_Number_of_chil_Load_10_14_years: true, J_3_4_No_of_child_viral_supp: true } }),
    prisma.submission.aggregate({ where, _sum: { J_4_1_No_an_updated_vl_15_19: true, J_4_3_Number_missing_Load_15_19_years: true, J_4_4_No_virally_suppressed: true } }),
    prisma.submission.aggregate({ where, _sum: { J_5_1_tt_no_updated_vl_all: true, J_5_3_Total_number_m_a_recent_Viral_Load: true, J_5_4_Tt_no_of_CALHIV_supp: true } }),
  ])

  const totalUpdated = s(j5._sum.J_5_1_tt_no_updated_vl_all)
  const totalSuppressed = s(j5._sum.J_5_4_Tt_no_of_CALHIV_supp)
  const vlSuppressionRate = totalUpdated > 0 ? Math.round((totalSuppressed / totalUpdated) * 1000) / 10 : 0

  const data = [
    { ageGroup: "0 - 4 years", updated: s(j1._sum.J_1_3_Number_of_chil_al_Load_0_4_years), suppressed: s(j1._sum.J_1_4_Number_of_children_supp), dtgPct: 0 },
    { ageGroup: "5 - 9 years", updated: s(j2._sum.J_2_3_Number_of_chil_al_Load_5_9_years), suppressed: s(j2._sum.J_2_4_Number_child_supp_vl), dtgPct: 0 },
    { ageGroup: "10 - 14 years", updated: s(j3._sum.J_3_3_Number_of_chil_Load_10_14_years), suppressed: s(j3._sum.J_3_4_No_of_child_viral_supp), dtgPct: 0 },
    { ageGroup: "15 - 19 years", updated: s(j4._sum.J_4_3_Number_missing_Load_15_19_years) + s(j4._sum.J_4_4_No_virally_suppressed), suppressed: s(j4._sum.J_4_4_No_virally_suppressed), dtgPct: 0 },
  ].map((r) => ({
    ...r,
    suppressedPct: r.updated > 0 ? Math.round((r.suppressed / r.updated) * 1000) / 10 : 0,
  }))

  return NextResponse.json(
    {
      data,
      totalUpdated,
      totalSuppressed,
      vlSuppressionRate,
    },
    { headers: NO_STORE },
  )
}
