import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"

const s = (v: number | null | undefined) => v ?? 0

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const agg = await prisma.submission.aggregate({
    where,
    _sum: {
      M_2_1_No_receiving_MMD_3: true,
      M_2_3_Nuo_receiving_MMD_6: true,
      M_3_1_No_under_Cddp: true,
      M_3_3_No_under_Cclad: true,
      M_3_5_No_under_Crpddp: true,
      M_3_7_No_under_Fbim: true,
      M_3_9_No_under_Fbg: true,
      M_3_11_No_under_Ftdr: true,
      M_1_1_No_enrolled_in_a_psy: true,
      M_1_3_Number_enrolled_in_peer: true,
    },
  })

  const mmd3 = s(agg._sum.M_2_1_No_receiving_MMD_3)
  const mmd6 = s(agg._sum.M_2_3_Nuo_receiving_MMD_6)
  const totalMmd = mmd3 + mmd6
  const mmdData = [
    { period: "3 Months", number: mmd3, percentage: totalMmd > 0 ? Math.round((mmd3 / totalMmd) * 1000) / 10 : 0 },
    { period: "6 Months", number: mmd6, percentage: totalMmd > 0 ? Math.round((mmd6 / totalMmd) * 1000) / 10 : 0 },
  ]

  const cddp = s(agg._sum.M_3_1_No_under_Cddp)
  const cclad = s(agg._sum.M_3_3_No_under_Cclad)
  const crpddp = s(agg._sum.M_3_5_No_under_Crpddp)
  const fbim = s(agg._sum.M_3_7_No_under_Fbim)
  const fbg = s(agg._sum.M_3_9_No_under_Fbg)
  const ftdr = s(agg._sum.M_3_11_No_under_Ftdr)
  const totalDsd = cddp + cclad + crpddp + fbim + fbg + ftdr
  const dsdData = [
    { model: "CDDP", number: cddp, percentage: totalDsd > 0 ? Math.round((cddp / totalDsd) * 1000) / 10 : 0 },
    { model: "CCLAD", number: cclad, percentage: totalDsd > 0 ? Math.round((cclad / totalDsd) * 1000) / 10 : 0 },
    { model: "CRPDDP", number: crpddp, percentage: totalDsd > 0 ? Math.round((crpddp / totalDsd) * 1000) / 10 : 0 },
    { model: "FBIM", number: fbim, percentage: totalDsd > 0 ? Math.round((fbim / totalDsd) * 1000) / 10 : 0 },
    { model: "FBG", number: fbg, percentage: totalDsd > 0 ? Math.round((fbg / totalDsd) * 1000) / 10 : 0 },
    { model: "FTDR", number: ftdr, percentage: totalDsd > 0 ? Math.round((ftdr / totalDsd) * 1000) / 10 : 0 },
  ]

  const supportData = [
    { service: "Psychosocial Support", enrolled: s(agg._sum.M_1_1_No_enrolled_in_a_psy), total: s(agg._sum.M_1_1_No_enrolled_in_a_psy) },
    { service: "Peer Support/Teen Club", enrolled: s(agg._sum.M_1_3_Number_enrolled_in_peer), total: s(agg._sum.M_1_3_Number_enrolled_in_peer) },
  ]

  return NextResponse.json({ mmdData, dsdData, supportData })
}
