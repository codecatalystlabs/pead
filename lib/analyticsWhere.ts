import type { AuthClaims } from "./auth"

export type WhereSubmission = Record<string, unknown>

export function buildSubmissionWhere(auth: AuthClaims | null): WhereSubmission {
  if (!auth) return {}
  const where: WhereSubmission = {}
  if (auth.jurisdictionLevel === "REGIONAL" && auth.region) {
    where.region = auth.region
  } else if (auth.jurisdictionLevel === "DISTRICT" && auth.district) {
    where.district = auth.district
  } else if (auth.jurisdictionLevel === "FACILITY" && auth.facility) {
    where.facility = auth.facility
  }
  return where
}
