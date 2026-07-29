import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, firstString, sumPaths } from "@/lib/jsonMetric"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const F = "section_f"

const STOCKOUT_PATHS = [
  { commodity: "ABC/3TC/DTG 60/30/5 mg (90 tabs)", days: [`${F}.abc_3tc_dtg_60_30_5mg_90tabs_days_of_stockout`], stock: [`${F}.abc_3tc_dtg_60_30_5mg_90tabs_stock_at_hand`] },
  { commodity: "ABC/3TC/DTG 60/30/5 mg (180 tabs)", days: [`${F}.abc_3tc_dtg_60_30_5mg_180tabs_days_of_stockout`], stock: [`${F}.abc_3tc_dtg_60_30_5mg_180tabs_stock_at_hand`] },
  { commodity: "ABC/3TC 120/60 mg", days: [`${F}.abc_3tc_120_60mg_days_of_stockout`], stock: [`${F}.abc_3tc_120_60mg_stock_at_hand`] },
  { commodity: "DTG 10 mg", days: [`${F}.dtg_10mg_days_of_stockout`], stock: [`${F}.dtg_10mg_stock_at_hand`] },
  { commodity: "AZT/3TC 60/30 mg", days: [`${F}.azt_3tc_60_30mg_days_of_stockout`], stock: [`${F}.azt_3tc_60_30mg_stock_at_hand`] },
  { commodity: "Darunavir", days: [`${F}.darunavir_days_of_stockout`], stock: [`${F}.darunavir_stock_at_hand`] },
]

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>

  const rows = await prisma.submission.findMany({ where, select: { data: true } })

  const stockAgg = STOCKOUT_PATHS.map((c) => ({
    commodity: c.commodity,
    daysOfStockout: 0,
    sitesWithStock: 0,
    sitesReporting: 0,
  }))

  let secondLine = 0
  let thirdLine = 0
  let firstLineProxy = 0
  let line1Sites = 0
  let line2Sites = 0
  let line3Sites = 0

  for (const row of rows) {
    const f = flattenToLowerMap(row.data)
    STOCKOUT_PATHS.forEach((c, i) => {
      const days = sumPaths(f, c.days)
      const stock = sumPaths(f, c.stock)
      stockAgg[i].daysOfStockout += days
      stockAgg[i].sitesReporting += 1
      if (stock > 0) stockAgg[i].sitesWithStock += 1
    })

    const on2 = sumPaths(f, [`${F}.availability_of_first_second_and_third_line_regimen.number_on_secondline_regimen`])
    const on3 = sumPaths(f, [`${F}.availability_of_first_second_and_third_line_regimen.number_on_third_line_regimen`])
    secondLine += on2
    thirdLine += on3
    // first line often not explicit — approximate from in-care minus 2nd/3rd when available
    const inCare = sumPaths(f, ["section_b.total_number_recieving_care", "section_l.number_in_care"])
    if (inCare > 0) firstLineProxy += Math.max(0, inCare - on2 - on3)

    const avail1 = firstString(f, [`${F}.availability_of_first_second_and_third_line_regimen.available_regimen_line_1`])
    const avail2 = firstString(f, [`${F}.availability_of_first_second_and_third_line_regimen.available_regimen_line_2`])
    const avail3 = firstString(f, [`${F}.availability_of_first_second_and_third_line_regimen.available_regimen_line_3`])
    if (avail1 && !/none/i.test(avail1)) line1Sites += 1
    if (avail2 && !/none/i.test(avail2)) line2Sites += 1
    if (avail3 && !/none/i.test(avail3)) line3Sites += 1
  }

  const data = stockAgg.map((c) => {
    const avgDays = c.sitesReporting > 0 ? Math.round((c.daysOfStockout / c.sitesReporting) * 10) / 10 : 0
    const availabilityPct = c.sitesReporting > 0 ? Math.round((c.sitesWithStock / c.sitesReporting) * 1000) / 10 : 0
    let status: "good" | "warning" | "critical" = "good"
    if (avgDays > 7 || availabilityPct < 50) status = "critical"
    else if (avgDays > 0 || availabilityPct < 80) status = "warning"
    return {
      commodity: c.commodity,
      daysOfStockout: avgDays,
      sitesWithStock: c.sitesWithStock,
      sitesReporting: c.sitesReporting,
      availabilityPct,
      status,
      // legacy field for older UI
      mos: avgDays,
      optimal: 0,
    }
  })

  const regimenLines = [
    { line: "First-line", number: firstLineProxy, availableSites: line1Sites },
    { line: "Second-line", number: secondLine, availableSites: line2Sites },
    { line: "Third-line", number: thirdLine, availableSites: line3Sites },
  ]

  return NextResponse.json({ data, regimenLines }, { headers: NO_STORE })
}
