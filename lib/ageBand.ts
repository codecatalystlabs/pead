export type AgeBandRow = {
  ageGroup?: string
  [key: string]: unknown
}

function normAgeGroup(ageGroup: string): string {
  return ageGroup.replace(/\s+/g, "").replace("years", "").replace("year", "")
}

export function filterRowsByAgeBand<T extends AgeBandRow>(rows: T[], ageBand?: string | null): T[] {
  if (!ageBand) return rows
  const normalized = ageBand.replace(/\s+/g, "")
  return rows.filter((row) => {
    if (!row.ageGroup) return false
    return normAgeGroup(row.ageGroup).startsWith(normalized)
  })
}
