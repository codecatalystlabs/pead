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

function trimParam(v: string | null): string | undefined {
  if (v == null || v === "") return undefined
  const t = v.trim()
  return t === "" ? undefined : t
}

export function parseFilterParams(url: string): FilterParams {
  const u = new URL(url, "http://localhost")
  return {
    region: trimParam(u.searchParams.get("region")),
    district: trimParam(u.searchParams.get("district")),
    facility: trimParam(u.searchParams.get("facility")),
    reportingPeriod: trimParam(u.searchParams.get("reportingPeriod")),
    dateFrom: trimParam(u.searchParams.get("dateFrom")),
    dateTo: trimParam(u.searchParams.get("dateTo")),
  }
}

/** String filter: case-insensitive match so "Central" matches "central" in DB. */
function stringFilter(value: string): { equals: string; mode: "insensitive" } {
  return { equals: value.trim(), mode: "insensitive" }
}

function toDateSafe(value: string | undefined | null): Date | null {
  if (value == null || typeof value !== "string") return null
  const d = new Date(value.trim())
  return Number.isNaN(d.getTime()) ? null : d
}

function endOfDay(date: Date): Date {
  const d = new Date(date.getTime())
  d.setHours(23, 59, 59, 999)
  return d
}

export function buildWhereWithFilters(auth: AuthClaims | null, url: string): WhereSubmission {
  const where = buildSubmissionWhere(auth) as Record<string, unknown>
  const params = parseFilterParams(url)

  if (params.region) where.region = stringFilter(params.region)
  if (params.district) where.district = stringFilter(params.district)
  if (params.facility) where.facility = stringFilter(params.facility)
  if (params.reportingPeriod)
    (where as Record<string, unknown>).A_5_Reporting_period_quarter = stringFilter(params.reportingPeriod)

  const dateFrom = toDateSafe(params.dateFrom ?? null)
  const dateTo = toDateSafe(params.dateTo ?? null)
  if (dateFrom != null || dateTo != null) {
    where.submissionDate = {}
    if (dateFrom) (where.submissionDate as Record<string, unknown>).gte = dateFrom
    if (dateTo) (where.submissionDate as Record<string, unknown>).lte = endOfDay(dateTo)
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
