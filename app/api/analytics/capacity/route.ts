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

  const [capacity, retention] = await Promise.all([
    prisma.submission.aggregate({
      where,
      _sum: { total_number_hw_at_site: true, number_hw_trained_integra: true, no_hf_staff_eligible_pald: true, number_hf_staff_oriented_pald: true },
    }),
    prisma.submission.aggregate({
      where,
      _sum: { I_1_How_many_CALHIV_or_review_last_month: true, I_1_1_Of_those_who_w_r_their_appointments: true },
    }),
  ])

  const totalHw = s(capacity._sum.total_number_hw_at_site)
  const trained = s(capacity._sum.number_hw_trained_integra)
  const data = [
    { cadre: "Integration-trained", trained, total: totalHw, pct: totalHw > 0 ? Math.round((trained / totalHw) * 1000) / 10 : 0 },
    { cadre: "pALD-oriented", trained: s(capacity._sum.number_hf_staff_oriented_pald), total: s(capacity._sum.no_hf_staff_eligible_pald), pct: s(capacity._sum.no_hf_staff_eligible_pald) > 0 ? Math.round((s(capacity._sum.number_hf_staff_oriented_pald) / s(capacity._sum.no_hf_staff_eligible_pald)) * 1000) / 10 : 0 },
  ]

  const inCare = s(retention._sum.I_1_How_many_CALHIV_or_review_last_month)
  const keptAppointments = s(retention._sum.I_1_1_Of_those_who_w_r_their_appointments)
  const retentionData = [
    { cohort: "In care (last month)", active: inCare, ltfu: 0, dead: 0, transferredOut: 0, transferredIn: 0 },
    { cohort: "Kept appointments", active: keptAppointments, ltfu: 0, dead: 0, transferredOut: 0, transferredIn: 0 },
  ]

  return NextResponse.json({ data, retentionData }, { headers: NO_STORE })
}
