"use client"

import { useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"

export function PALDDataContext() {
  const { queryString, filters } = useDashboardFilters()
  const [ctx, setCtx] = useState<{
    totalCalhiv: number
    paldOnPald: number
    submissionCount: number
    dataQualityWarnings: string[]
    dataQualitySummary: {
      totalCalhivFromAgeBands: number
      totalCalhivFromWeightBands: number
      paldEligibleByWeight: number
      paldOnPaldByAge: number
      paldOnPaldByWeight: number
      careModelPatients: number
      inconsistentSubmissionCount: number
      affectedFacilities: string[]
    } | null
    noData?: boolean
    message?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch(`/api/analytics/pald${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!isMounted) return
        setCtx({
          totalCalhiv: data.totalCalhiv ?? 0,
          paldOnPald: data.paldOnPald ?? 0,
          submissionCount: data.submissionCount ?? 0,
          dataQualityWarnings: Array.isArray(data.dataQualityWarnings) ? data.dataQualityWarnings : [],
          dataQualitySummary: data.dataQualitySummary ?? null,
          noData: !!data.noData,
          message: data.message ?? null,
        })
      })
      .catch(() => { if (isMounted) setCtx(null) })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [queryString])

  const hasFilters =
    !!filters.region ||
    !!filters.district ||
    !!filters.facility ||
    !!filters.ageBand ||
    !!filters.reportingPeriod ||
    !!filters.dateFrom ||
    !!filters.dateTo

  if (loading && !ctx) return null
  if (!ctx) return null

  const pct = ctx.totalCalhiv > 0 ? Math.min(100, (ctx.paldOnPald / ctx.totalCalhiv) * 100) : 0
  const oneRecord = ctx.submissionCount === 1
  const summary = ctx.dataQualitySummary
  const affectedFacilities = summary?.affectedFacilities ?? []
  const facilityPreview =
    affectedFacilities.length > 4
      ? `${affectedFacilities.slice(0, 4).join(", ")} +${affectedFacilities.length - 4} more`
      : affectedFacilities.join(", ")

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-sm">
      {hasFilters && (
        <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">
          Filtered by:{" "}
          {[filters.region && `Region: ${filters.region}`, filters.district && `District: ${filters.district}`, filters.facility && `Facility: ${filters.facility}`, filters.ageBand && `Age band: ${filters.ageBand}`, filters.reportingPeriod && `Period: ${filters.reportingPeriod}`, filters.dateFrom && `From: ${filters.dateFrom}`, filters.dateTo && `To: ${filters.dateTo}`]
            .filter(Boolean)
            .join(" · ")}
        </div>
      )}
      <span className="text-slate-600 dark:text-slate-400">
        <strong className="text-slate-800 dark:text-slate-200">Total CALHIV:</strong> {ctx.totalCalhiv.toLocaleString()}
        {" · "}
        <strong className="text-slate-800 dark:text-slate-200">On pALD:</strong> {ctx.paldOnPald.toLocaleString()} ({pct.toFixed(1)}%)
        {" · "}
        <strong className="text-slate-800 dark:text-slate-200">{ctx.submissionCount} submission{ctx.submissionCount !== 1 ? "s" : ""}</strong>
      </span>
      {loading && <span className="ml-2 text-slate-400 animate-pulse">Updating…</span>}
      {!loading && ctx.noData && ctx.message && (
        <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
          {ctx.message}
        </span>
      )}
      {!loading && !ctx.noData && oneRecord && (
        <span className="ml-2 text-slate-500 dark:text-slate-400 italic">
          All metrics and charts below are from this single submission.
        </span>
      )}
      {!loading && !ctx.noData && summary && ctx.dataQualityWarnings.length > 0 && (
        <details className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <summary className="cursor-pointer font-medium">
            Selected submissions do not fully reconcile across form sections.
          </summary>
          <div className="mt-2 space-y-1">
            <p>
              Reported total CALHIV: {ctx.totalCalhiv.toLocaleString()}.
              {" "}Age bands: {summary.totalCalhivFromAgeBands.toLocaleString()}.
              {" "}Weight bands: {summary.totalCalhivFromWeightBands.toLocaleString()}.
            </p>
            <p>
              Reported on pALD: {summary.paldOnPaldByWeight.toLocaleString()}.
              {" "}Age-band on pALD: {summary.paldOnPaldByAge.toLocaleString()}.
              {" "}Weight-band eligible: {summary.paldEligibleByWeight.toLocaleString()}.
            </p>
            {summary.careModelPatients > 0 && (
              <p>
                Care-model totals: {summary.careModelPatients.toLocaleString()}.
              </p>
            )}
            <p>
              {summary.inconsistentSubmissionCount} of {ctx.submissionCount} submission{ctx.submissionCount !== 1 ? "s" : ""} have at least one mismatch.
              {facilityPreview ? ` Review: ${facilityPreview}.` : ""}
            </p>
          </div>
        </details>
      )}
    </div>
  )
}
