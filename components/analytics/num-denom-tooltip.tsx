"use client"

import type { TooltipProps } from "recharts"

export interface NumDenomRow {
  label: string
  numerator: number
  denominator: number
  suffix?: string
}

/**
 * Tooltip that shows numerator/denominator and optional default bars.
 * getRows receives the row payload (e.g. payload[0].payload) and returns rows to show as "n / d (pct%)".
 */
export function NumDenomTooltipContent({
  active,
  payload,
  label,
  getRows,
  showDefaultBars = true,
}: TooltipProps<number, string> & {
  getRows?: (rowPayload: Record<string, unknown>) => NumDenomRow[]
  showDefaultBars?: boolean
}) {
  if (!active || !payload?.length) return null

  const rowPayload = (payload[0]?.payload as Record<string, unknown>) ?? {}
  const resolvedLabel = label != null ? String(label) : ""
  const rows = getRows ? getRows(rowPayload) : []

  return (
    <div className="grid min-w-[10rem] rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      {resolvedLabel && <div className="font-medium border-b border-border/50 pb-1 mb-1">{resolvedLabel}</div>}
      {rows.length > 0 && (
        <div className="grid gap-1 mb-1">
          {rows.map((row, i) => {
            const pct = row.denominator > 0 ? ((row.numerator / row.denominator) * 100).toFixed(1) : "0.0"
            return (
              <div key={i} className="flex justify-between gap-4">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-mono font-medium tabular-nums">
                  {row.numerator.toLocaleString()} / {row.denominator.toLocaleString()}
                  {row.suffix !== undefined ? row.suffix : ` (${pct}%)`}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {showDefaultBars && payload.map((item) => (
        <div key={String(item.dataKey)} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{String(item.name ?? item.dataKey)}</span>
          <span className="font-mono font-medium tabular-nums">{Number(item.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
