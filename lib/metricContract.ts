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
  if (status === "good") return "border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/30"
  if (status === "warning") return "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30"
  if (status === "critical") return "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30"
  return ""
}
