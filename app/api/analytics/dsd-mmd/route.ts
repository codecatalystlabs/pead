import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, sumPaths } from "@/lib/jsonMetric"
import { MMD_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })

  let mmd3 = 0
  let mmd6 = 0
  let cddp = 0
  let cclad = 0
  let crpddp = 0
  let fbim = 0
  let fbg = 0
  let ftdr = 0
  let psychosocial = 0
  let peer = 0

  for (const row of rows) {
    const f = flattenToLowerMap(row.data)
    mmd3 += sumPaths(f, MMD_PATHS.mmd3)
    mmd6 += sumPaths(f, MMD_PATHS.mmd6)
    cddp += sumPaths(f, MMD_PATHS.cddp)
    cclad += sumPaths(f, MMD_PATHS.cclad)
    crpddp += sumPaths(f, MMD_PATHS.crpddp)
    fbim += sumPaths(f, MMD_PATHS.fbim)
    fbg += sumPaths(f, MMD_PATHS.fbg)
    ftdr += sumPaths(f, MMD_PATHS.ftdr)
    psychosocial += sumPaths(f, MMD_PATHS.psychosocial)
    peer += sumPaths(f, MMD_PATHS.peer)
  }

  const totalMmd = mmd3 + mmd6
  const mmdData = [
    { period: "3 Months", number: mmd3, percentage: totalMmd > 0 ? Math.round((mmd3 / totalMmd) * 1000) / 10 : 0 },
    { period: "6 Months", number: mmd6, percentage: totalMmd > 0 ? Math.round((mmd6 / totalMmd) * 1000) / 10 : 0 },
  ]
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
    { service: "Psychosocial Support", enrolled: psychosocial, total: psychosocial },
    { service: "Peer Support/Teen Club", enrolled: peer, total: peer },
  ]

  return NextResponse.json({ mmdData, dsdData, supportData }, { headers: NO_STORE })
}
