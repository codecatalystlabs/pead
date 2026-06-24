export type FlatLowerMap = Record<string, unknown>

export function flattenToLowerMap(input: unknown, prefix = "", out: FlatLowerMap = {}): FlatLowerMap {
  if (input == null) return out
  if (Array.isArray(input)) {
    input.forEach((item, i) => {
      const key = prefix ? `${prefix}.${i}` : String(i)
      flattenToLowerMap(item, key, out)
    })
    return out
  }
  if (typeof input !== "object") return out

  const rec = input as Record<string, unknown>
  for (const [k, v] of Object.entries(rec)) {
    const key = (prefix ? `${prefix}.${k}` : k).toLowerCase()
    if (v != null && typeof v === "object" && !(v instanceof Date)) {
      flattenToLowerMap(v, key, out)
    } else {
      out[key] = v
    }
  }
  return out
}

export function toNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export function sumPaths(flat: FlatLowerMap, paths: string[]): number {
  return paths.reduce((acc, p) => acc + toNum(flat[p.toLowerCase()]), 0)
}

export function typedOrJson(
  typed: number | null | undefined,
  flat: FlatLowerMap,
  jsonPaths: string[],
): number {
  if (typed != null) return typed
  return sumPaths(flat, jsonPaths)
}

/** First non-empty string value from flattened JSON paths. */
export function firstString(flat: FlatLowerMap, paths: string[]): string | null {
  for (const p of paths) {
    const v = flat[p.toLowerCase()]
    if (v != null && String(v).trim() !== "") return String(v).trim()
  }
  return null
}

export function isYes(flat: FlatLowerMap, paths: string[]): boolean {
  for (const p of paths) {
    const v = String(flat[p.toLowerCase()] ?? "").toLowerCase()
    if (v === "yes" || v === "true" || v === "1") return true
  }
  return false
}
