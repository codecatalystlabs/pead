import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, firstString, sumPaths } from "@/lib/jsonMetric"
import { AGE_BAND_KEYS, MMD_PATHS, type AgeBandKey } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const L = "section_l"

const DSD_MODELS = [
  { key: "cddp", code: "CDDP", label: "Community Drug Distribution Point (CDDP)" },
  { key: "cclad", code: "CCLAD", label: "Community Client-Led ART Delivery (CCLAD)" },
  { key: "crpddp", code: "CRPDDP", label: "Community Retail Pharmacy Drug Distribution Point (CRPDDP)" },
  { key: "fbim", code: "FBIM", label: "Facility-Based Individual Management (FBIM)" },
  { key: "fbg", code: "FBG", label: "Facility-Based Groups (FBG)" },
  { key: "ftdr", code: "FTDR", label: "Fast-Track Drug Refill (FTDR)" },
] as const

function uniqPush(arr: string[], v: string | null) {
  if (!v) return
  const t = v.trim()
  if (t && !arr.includes(t)) arr.push(t)
}

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })

  const mmdByAge: Record<AgeBandKey, { mmd3: number; mmd6: number }> = {
    "0 - 4 years": { mmd3: 0, mmd6: 0 },
    "5 - 9 years": { mmd3: 0, mmd6: 0 },
    "10 - 14 years": { mmd3: 0, mmd6: 0 },
    "15 - 19 years": { mmd3: 0, mmd6: 0 },
  }
  const ageSuffix: Record<AgeBandKey, string[]> = {
    "0 - 4 years": ["under_5yrs"],
    "5 - 9 years": ["5_9yrs"],
    "10 - 14 years": ["10_14yrs"],
    "15 - 19 years": ["15_19yrs"],
  }

  const dsdTotals: Record<string, number> = Object.fromEntries(DSD_MODELS.map((m) => [m.key, 0]))
  let psychosocial = 0
  let peer = 0
  let mmd3Total = 0
  let mmd6Total = 0

  const bestPractices = {
    successes: [] as string[],
    challenges: [] as string[],
    gaps: [] as string[],
    supportRequested: [] as string[],
  }

  for (const row of rows) {
    const f = flattenToLowerMap(row.data)
    for (const band of AGE_BAND_KEYS) {
      for (const sfx of ageSuffix[band]) {
        mmdByAge[band].mmd3 += sumPaths(f, [`${L}.number_receiving_mmd_3months_${sfx}`])
        mmdByAge[band].mmd6 += sumPaths(f, [`${L}.number_receiving_mmd_6months_${sfx}`])
      }
    }
    mmd3Total += sumPaths(f, MMD_PATHS.mmd3)
    mmd6Total += sumPaths(f, MMD_PATHS.mmd6)
    dsdTotals.cddp += sumPaths(f, MMD_PATHS.cddp)
    dsdTotals.cclad += sumPaths(f, MMD_PATHS.cclad)
    dsdTotals.crpddp += sumPaths(f, MMD_PATHS.crpddp)
    dsdTotals.fbim += sumPaths(f, MMD_PATHS.fbim)
    dsdTotals.fbg += sumPaths(f, MMD_PATHS.fbg)
    dsdTotals.ftdr += sumPaths(f, MMD_PATHS.ftdr)
    psychosocial += sumPaths(f, MMD_PATHS.psychosocial)
    peer += sumPaths(f, MMD_PATHS.peer)

    uniqPush(bestPractices.successes, firstString(f, ["best_practices.dsd_mmd_comments.describe_success", "best_practices.key_best_pratices_"]))
    uniqPush(bestPractices.challenges, firstString(f, ["best_practices.dsd_mmd_comments.describe_challenges", "best_practices.key_challenges"]))
    uniqPush(bestPractices.gaps, firstString(f, ["best_practices.dsd_mmd_comments.describe_gaps"]))
    uniqPush(bestPractices.supportRequested, firstString(f, ["best_practices.support_requested"]))
  }

  const totalMmd = mmd3Total + mmd6Total
  const mmdData = [
    { period: "3 Months", number: mmd3Total, percentage: totalMmd > 0 ? Math.round((mmd3Total / totalMmd) * 1000) / 10 : 0 },
    { period: "6 Months", number: mmd6Total, percentage: totalMmd > 0 ? Math.round((mmd6Total / totalMmd) * 1000) / 10 : 0 },
  ]

  const mmdByAgeBand = AGE_BAND_KEYS.map((age) => {
    const mmd3 = mmdByAge[age].mmd3
    const mmd6 = mmdByAge[age].mmd6
    return { age, mmd3, mmd6, total: mmd3 + mmd6 }
  })

  const totalDsd = Object.values(dsdTotals).reduce((a, b) => a + b, 0)
  const dsdData = DSD_MODELS.map((m) => ({
    model: m.label,
    code: m.code,
    number: dsdTotals[m.key],
    percentage: totalDsd > 0 ? Math.round((dsdTotals[m.key] / totalDsd) * 1000) / 10 : 0,
  }))

  const supportData = [
    { service: "Psychosocial Support", enrolled: psychosocial, total: psychosocial },
    { service: "Peer Support / Teen Club", enrolled: peer, total: peer },
  ]

  return NextResponse.json(
    { mmdData, mmdByAgeBand, dsdData, supportData, bestPractices },
    { headers: NO_STORE },
  )
}
