"use client"

import type { ReactNode } from "react"
import type { CascadeStep } from "./colors"

export function SecTitle({ children }: { children: ReactNode }) {
  return <h2 className="sim-sec">{children}</h2>
}

export function SimCard({
  title,
  desc,
  children,
  className = "",
}: {
  title?: string
  desc?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`sim-card ${className}`}>
      {title ? <h3>{title}</h3> : null}
      {desc ? <p className="d">{desc}</p> : null}
      {children}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  footnote,
  tone,
}: {
  label: string
  value: string | number
  footnote?: string
  tone?: "good" | "warn" | "bad"
}) {
  return (
    <div className="sim-card sim-kpi">
      <div className="l">{label}</div>
      <div className={`v ${tone ?? ""}`}>{value}</div>
      {footnote ? <div className="f">{footnote}</div> : null}
    </div>
  )
}

export function ChartBox({ children }: { children: ReactNode }) {
  return <div className="sim-box">{children}</div>
}

export function LegendRow({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="sim-lg">
      {items.map((it) => (
        <span key={it.label}>
          <i style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

export function Note({ children, warn }: { children: ReactNode; warn?: boolean }) {
  return <div className={`sim-note${warn ? " warnflag" : ""}`}>{children}</div>
}

export function ToggleGroup({
  label,
  value,
  options,
  onChange,
  inline,
}: {
  label?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  inline?: boolean
}) {
  const body = (
    <>
      {label ? <span className="sim-tglab">{label}</span> : null}
      <div className="sim-tg">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </>
  )
  if (inline) return <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{body}</div>
  return <div className="sim-ctrls">{body}</div>
}

/** Cascade with per-step drop-off chips. Warns when a step exceeds the one above (Excel rule 1). */
export function Cascade({ steps }: { steps: CascadeStep[] }) {
  const top = Math.max(1, steps[0]?.n || 1)
  const inversions: string[] = []
  for (let i = 1; i < steps.length; i++) {
    if (steps[i].n > steps[i - 1].n) {
      inversions.push(
        `"${steps[i].label}" (${steps[i].n.toLocaleString()}) is larger than "${steps[i - 1].label}" (${steps[i - 1].n.toLocaleString()}) — data error; numbers are shown as reported.`,
      )
    }
  }
  return (
    <div>
      {inversions.length > 0 ? (
        <div className="sim-note warnflag" style={{ marginBottom: 10 }}>
          <b>Data warning:</b> {inversions.join(" ")}
        </div>
      ) : null}
      {steps.map((s, i) => {
        const w = Math.max(14, Math.round((s.n / top) * 100))
        let chip: ReactNode = null
        if (i > 0) {
          const prev = steps[i - 1].n
          const lost = prev - s.n
          if (lost < 0) {
            chip = (
              <span className="sim-gapchip gap-bad">
                +{Math.abs(lost).toLocaleString()} above step above (impossible)
              </span>
            )
          } else {
            const dropPct = prev > 0 ? Math.round((lost / prev) * 100) : 0
            let cls = "gap-ok"
            if (dropPct > 50) cls = "gap-bad"
            else if (dropPct > 25) cls = "gap-warn"
            chip = (
              <span className={`sim-gapchip ${cls}`}>
                −{lost.toLocaleString()} ({dropPct}% drop)
              </span>
            )
          }
        }
        return (
          <div key={`${s.label}-${i}`} className="sim-cscrow">
            <div className="sim-step" style={{ background: s.color, width: `${Math.min(100, w)}%` }}>
              <span>{s.label}</span>
              <b>{s.n.toLocaleString()}</b>
            </div>
            {chip}
          </div>
        )
      })}
    </div>
  )
}

export function MiniTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | { text: string; className?: string })[][]
}) {
  return (
    <table className="sim-mini">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => {
              if (typeof cell === "string") return <td key={j}>{cell}</td>
              return (
                <td key={j} className={cell.className}>
                  {cell.text}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
