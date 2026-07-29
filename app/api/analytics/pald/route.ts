import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { buildWhereWithFilters } from "@/lib/analyticsFilters"
import { flattenToLowerMap, firstString } from "@/lib/jsonMetric"
import { aggregatePaldFromFlat, formatReportingQuarter, META_PATHS } from "@/lib/odkFieldMap"

export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store, no-cache" }

const EMPTY_PALD_RESPONSE = {
  weightBandData: [],
  weightBandDataForTransition: [],
  ageBandData: [],
  careModelData: [
    { name: "Mixed OPD", value: 0, patients: 0 },
    { name: "Chronic Care/Clinic Day", value: 0, patients: 0 },
    { name: "Other Models", value: 0, patients: 0 },
  ],
  cascade: { inCare: 0, on1206010: 0, eligible: 0, onPald: 0 },
  transitionTrendsData: [{ month: "-", pALD: 0, nonPALD: 0 }],
  totalCalhiv: 0,
  paldOnPald: 0,
  nonPaldTotal: 0,
  submissionCount: 0,
  dataQualityWarnings: [],
  dataQualitySummary: null,
  noData: true,
  message: "No data for the selected filters or period.",
}

const QUARTER_ORDER = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const where = buildWhereWithFilters(auth, req.url) as Record<string, unknown>
    const rows = await prisma.submission.findMany({
      where,
      select: { data: true, facility: true, submissionDate: true, A_5_Reporting_period_quarter: true },
    })

    if (!rows.length) {
      return NextResponse.json({ ...EMPTY_PALD_RESPONSE }, { headers: NO_STORE })
    }

    const ageTotals = {
      "0 - 4 years": { inCare: 0, onPald: 0, eligible: 0 },
      "5 - 9 years": { inCare: 0, onPald: 0, eligible: 0 },
      "10 - 14 years": { inCare: 0, onPald: 0, eligible: 0 },
      "15 - 19 years": { inCare: 0, onPald: 0, eligible: 0 },
    }
    const weightTotals = new Map<string, { clhiv: number; alhiv: number; eligible: number; transitioned: number }>()
    let totalCalhiv = 0
    let paldOnPald = 0
    let paldEligible = 0
    let nonPaldTotal = 0
    let clinicDay = 0
    let mixedOpd = 0
    let otherModels = 0
    const periodMap = new Map<string, { pald: number; nonPald: number }>()
    const submissionIssues: { facility: string; issues: string[] }[] = []

    for (const row of rows) {
      const flat = flattenToLowerMap(row.data)
      const agg = aggregatePaldFromFlat(flat)
      totalCalhiv += agg.totalCalhiv
      paldOnPald += agg.paldOnPald
      paldEligible += agg.paldEligible
      nonPaldTotal += agg.nonPald
      clinicDay += agg.clinicDay
      mixedOpd += agg.mixedOpd
      otherModels += agg.otherModels

      for (const a of agg.ageBandData) {
        ageTotals[a.age].inCare += a.inCare
        ageTotals[a.age].onPald += a.onPald
        ageTotals[a.age].eligible += a.eligible
      }
      for (const w of agg.weightBandData) {
        const cur = weightTotals.get(w.band) ?? { clhiv: 0, alhiv: 0, eligible: 0, transitioned: 0 }
        weightTotals.set(w.band, {
          clhiv: cur.clhiv + w.clhiv,
          alhiv: cur.alhiv + w.alhiv,
          eligible: cur.eligible + w.eligible,
          transitioned: cur.transitioned + w.transitioned,
        })
      }

      const period =
        formatReportingQuarter(row.A_5_Reporting_period_quarter) ??
        formatReportingQuarter(firstString(flat, META_PATHS.reportingQuarter)) ??
        "Other"
      const cur = periodMap.get(period) ?? { pald: 0, nonPald: 0 }
      periodMap.set(period, { pald: cur.pald + agg.paldOnPald, nonPald: cur.nonPald + agg.nonPald })

      const issues: string[] = []
      const ageSum = agg.ageBandData.reduce((s, r) => s + r.inCare, 0)
      if (agg.totalCalhiv > 0 && ageSum > 0 && agg.totalCalhiv !== ageSum) {
        issues.push(`age-band total ${ageSum} vs reported ${agg.totalCalhiv}`)
      }
      if (issues.length) {
        submissionIssues.push({
          facility: row.facility ?? firstString(flat, META_PATHS.facility) ?? "Unknown",
          issues,
        })
      }
    }

    const ageBandData = Object.entries(ageTotals).map(([age, v]) => ({
      age,
      inCare: v.inCare,
      onPald: v.onPald,
      pct: v.inCare > 0 ? Math.round((v.onPald / v.inCare) * 1000) / 10 : 0,
    }))

    const weightBandOrder = [
      "3 - 5.9 kg",
      "6 - 9.9 kg",
      "10 - 13.9 kg",
      "14 - 19.9 kg",
      "20 - 24.9 kg",
      "25 - 29.9 kg",
      "≥30 kg",
    ]
    const weightBandData = weightBandOrder
      .filter((band) => weightTotals.has(band))
      .map((band) => {
        const v = weightTotals.get(band)!
        return {
          band,
          clhiv: v.clhiv,
          alhiv: v.alhiv,
          eligible: v.eligible,
          transitioned: v.transitioned,
          pct: v.eligible > 0 ? Math.round((v.transitioned / v.eligible) * 1000) / 10 : 0,
        }
      })

    const totalCare = mixedOpd + clinicDay + otherModels
    const careModelData = [
      {
        name: "Mixed OPD",
        value: totalCare > 0 ? Math.round((mixedOpd / totalCare) * 100) : 0,
        patients: mixedOpd,
      },
      {
        name: "Chronic Care/Clinic Day",
        value: totalCare > 0 ? Math.round((clinicDay / totalCare) * 100) : 0,
        patients: clinicDay,
      },
      {
        name: "Other Models",
        value: totalCare > 0 ? Math.round((otherModels / totalCare) * 100) : 0,
        patients: otherModels,
      },
    ]

    const transitionTrendsData = Array.from(periodMap.entries())
      .filter(([period]) => period !== "Other" || periodMap.size === 1)
      .sort((a, b) => {
        const ia = QUARTER_ORDER.indexOf(a[0])
        const ib = QUARTER_ORDER.indexOf(b[0])
        if (ia >= 0 && ib >= 0) return ia - ib
        return a[0].localeCompare(b[0])
      })
      .map(([period, v]) => {
        const tot = v.pald + v.nonPald
        const pALD = tot > 0 ? Math.round((v.pald / tot) * 100) : 0
        return {
          month: period,
          pALD,
          // Complement so lines always move in opposite directions (composition share)
          nonPALD: tot > 0 ? Math.max(0, 100 - pALD) : 0,
          paldCount: v.pald,
          nonPaldCount: v.nonPald,
        }
      })

    const cascade = {
      inCare: totalCalhiv,
      on1206010: nonPaldTotal,
      eligible: paldEligible,
      onPald: paldOnPald,
    }

    const totalCalhivFromAgeBands = ageBandData.reduce((s, r) => s + r.inCare, 0)
    const totalCalhivFromWeightBands = weightBandData.reduce((s, r) => s + r.clhiv + r.alhiv, 0)
    const paldOnPaldByAge = ageBandData.reduce((s, r) => s + r.onPald, 0)
    const paldEligibleByWeight = weightBandData.reduce((s, r) => s + r.eligible, 0)

    const dataQualityWarnings: string[] = []
    if (totalCalhiv > 0 && totalCalhiv !== totalCalhivFromAgeBands) {
      dataQualityWarnings.push(
        `Reported total CALHIV is ${totalCalhiv.toLocaleString()}, but age-band totals sum to ${totalCalhivFromAgeBands.toLocaleString()}.`,
      )
    }
    if (totalCalhiv > 0 && totalCalhiv !== totalCalhivFromWeightBands) {
      dataQualityWarnings.push(
        `Reported total CALHIV is ${totalCalhiv.toLocaleString()}, but weight-band totals sum to ${totalCalhivFromWeightBands.toLocaleString()}.`,
      )
    }
    if (paldOnPald > paldEligibleByWeight && paldEligibleByWeight > 0) {
      dataQualityWarnings.push(
        `On pALD (${paldOnPald.toLocaleString()}) exceeds weight-band eligible (${paldEligibleByWeight.toLocaleString()}).`,
      )
    }
    if (submissionIssues.length > 0) {
      dataQualityWarnings.push(`${submissionIssues.length} of ${rows.length} submissions have section mismatches.`)
    }

    return NextResponse.json(
      {
        weightBandData,
        weightBandDataForTransition: weightBandData.filter((r) => r.eligible > 0 || r.transitioned > 0),
        ageBandData,
        careModelData,
        cascade,
        nonPaldTotal,
        transitionTrendsData:
          transitionTrendsData.length > 0 ? transitionTrendsData : [{ month: "-", pALD: 0, nonPALD: 0 }],
        totalCalhiv,
        paldOnPald,
        submissionCount: rows.length,
        dataQualityWarnings,
        dataQualitySummary: {
          totalCalhivFromAgeBands,
          totalCalhivFromWeightBands,
          paldEligibleByWeight,
          paldOnPaldByAge,
          paldOnPaldByWeight: paldOnPald,
          careModelPatients: clinicDay + mixedOpd + otherModels,
          inconsistentSubmissionCount: submissionIssues.length,
          affectedFacilities: submissionIssues.map((r) => r.facility),
        },
        noData: false,
      },
      { headers: NO_STORE },
    )
  } catch (_err) {
    return NextResponse.json({ ...EMPTY_PALD_RESPONSE }, { status: 200, headers: NO_STORE })
  }
}
