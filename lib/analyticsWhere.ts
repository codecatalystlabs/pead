import type { AuthClaims } from "./auth"

export type WhereSubmission = Record<string, unknown>
export type ScopedField = "region" | "district" | "facility"

function stringEquals(value: string): { equals: string; mode: "insensitive" } {
  return { equals: value.trim(), mode: "insensitive" }
}

export function buildSubmissionWhere(auth: AuthClaims | null): WhereSubmission {
  if (!auth) return {}
  const where: WhereSubmission = {}
  if (auth.jurisdictionLevel === "REGIONAL" && auth.region) {
    where.region = stringEquals(auth.region)
  } else if (auth.jurisdictionLevel === "DISTRICT" && auth.district) {
    where.district = stringEquals(auth.district)
  } else if (auth.jurisdictionLevel === "FACILITY" && auth.facility) {
    where.facility = stringEquals(auth.facility)
  }
  return where
}

export function canApplyScopedField(auth: AuthClaims | null, field: ScopedField): boolean {
  if (!auth) return false
  if (auth.jurisdictionLevel === "ADMIN" || auth.jurisdictionLevel === "NATIONAL") return true
  if (auth.jurisdictionLevel === "REGIONAL") return field !== "region"
  if (auth.jurisdictionLevel === "DISTRICT") return field === "facility"
  return false
}
