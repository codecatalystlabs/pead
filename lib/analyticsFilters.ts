/**
 * Parse filter query params from request URL and merge with auth-based where.
 * Used by all analytics API routes.
 */
import type { WhereSubmission } from "./analyticsWhere"
import { buildSubmissionWhere } from "./analyticsWhere"
import type { AuthClaims } from "./auth"

export interface FilterParams {
  region?: string | null
  district?: string | null
  facility?: string | null
  reportingPeriod?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}

export function parseFilterParams(url: string): FilterParams {
  const u = new URL(url, "http://localhost")
  return {
    region: u.searchParams.get("region") || undefined,
    district: u.searchParams.get("district") || undefined,
    facility: u.searchParams.get("facility") || undefined,
    reportingPeriod: u.searchParams.get("reportingPeriod") || undefined,
    dateFrom: u.searchParams.get("dateFrom") || undefined,
    dateTo: u.searchParams.get("dateTo") || undefined,
  }
}

export function buildWhereWithFilters(auth: AuthClaims | null, url: string): WhereSubmission {
  const where = buildSubmissionWhere(auth) as Record<string, unknown>
  const params = parseFilterParams(url)

  if (params.region) where.region = params.region
  if (params.district) where.district = params.district
  if (params.facility) where.facility = params.facility
  if (params.reportingPeriod) where.A_5_Reporting_period_quarter = params.reportingPeriod

  if (params.dateFrom || params.dateTo) {
    where.submissionDate = {}
    if (params.dateFrom) (where.submissionDate as Record<string, unknown>).gte = new Date(params.dateFrom)
    if (params.dateTo) {
      const d = new Date(params.dateTo)
      d.setHours(23, 59, 59, 999)
      (where.submissionDate as Record<string, unknown>).lte = d
    }
  }

  return where
}

export function filtersToQueryString(filters: FilterParams): string {
  const p = new URLSearchParams()
  if (filters.region) p.set("region", filters.region)
  if (filters.district) p.set("district", filters.district)
  if (filters.facility) p.set("facility", filters.facility)
  if (filters.reportingPeriod) p.set("reportingPeriod", filters.reportingPeriod)
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom)
  if (filters.dateTo) p.set("dateTo", filters.dateTo)
  const s = p.toString()
  return s ? `?${s}` : ""
}
