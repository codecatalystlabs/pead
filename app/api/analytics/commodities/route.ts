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

  const agg = await prisma.submission.aggregate({
    where,
    _sum: {
      G_3_3_What_is_the_mo_tock_MOS_available: true,
      G_4_3_What_is_the_mo_tock_MOS_available: true,
      G_5_3_What_is_the_mo_tock_MOS_available: true,
      G_6_3_What_is_the_mo_tock_MOS_available: true,
    },
    _count: { id: true },
  })

  const n = Math.max(agg._count.id, 1)
  const data = [
    { commodity: "pALD (60/30/5 mg)", mos: Math.round((s(agg._sum.G_3_3_What_is_the_mo_tock_MOS_available) / n) * 10) / 10, optimal: 3, status: s(agg._sum.G_3_3_What_is_the_mo_tock_MOS_available) / n >= 3 ? "good" : s(agg._sum.G_3_3_What_is_the_mo_tock_MOS_available) / n >= 1 ? "warning" : "critical" },
    { commodity: "ABC/3TC (120/60 mg)", mos: Math.round((s(agg._sum.G_4_3_What_is_the_mo_tock_MOS_available) / n) * 10) / 10, optimal: 3, status: s(agg._sum.G_4_3_What_is_the_mo_tock_MOS_available) / n >= 3 ? "good" : s(agg._sum.G_4_3_What_is_the_mo_tock_MOS_available) / n >= 1 ? "warning" : "critical" },
    { commodity: "DTG 10 mg", mos: Math.round((s(agg._sum.G_5_3_What_is_the_mo_tock_MOS_available) / n) * 10) / 10, optimal: 3, status: s(agg._sum.G_5_3_What_is_the_mo_tock_MOS_available) / n >= 3 ? "good" : s(agg._sum.G_5_3_What_is_the_mo_tock_MOS_available) / n >= 1 ? "warning" : "critical" },
    { commodity: "AZT/3TC (60/30 mg)", mos: Math.round((s(agg._sum.G_6_3_What_is_the_mo_tock_MOS_available) / n) * 10) / 10, optimal: 3, status: s(agg._sum.G_6_3_What_is_the_mo_tock_MOS_available) / n >= 3 ? "good" : s(agg._sum.G_6_3_What_is_the_mo_tock_MOS_available) / n >= 1 ? "warning" : "critical" },
    { commodity: "Darunavir (DRV)", mos: 0, optimal: 3, status: "critical" as const },
  ]

  return NextResponse.json({ data }, { headers: NO_STORE })
}
