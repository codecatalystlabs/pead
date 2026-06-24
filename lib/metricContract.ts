export type MetricStatus = "good" | "warning" | "critical" | "neutral"

export interface MetricContract {
  id: string
  title: string
  numerator: number
  denominator: number
  absolute: number
  rate: number
  description: string
}

export function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Math.min(100, (numerator / denominator) * 100)
}

export function statusFromRate(
  rate: number,
  thresholds: { warning: number; good: number },
): MetricStatus {
  if (rate >= thresholds.good) return "good"
  if (rate >= thresholds.warning) return "warning"
  return "critical"
}

export function statusClassName(status: MetricStatus): string {
  // Only background changes; keep border styling consistent across cards.
  // Use `!` so it always wins over `bg-card` on `Card`.
  if (status === "good") return "!bg-green-100/70 dark:!bg-green-950/45"
  if (status === "warning") return "!bg-amber-100/70 dark:!bg-amber-950/45"
  if (status === "critical") return "!bg-red-100/70 dark:!bg-red-950/45"
  return ""
}
