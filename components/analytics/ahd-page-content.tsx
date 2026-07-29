"use client"

import { useEffect, useMemo, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { SecTitle, SimCard, Note, ToggleGroup, Cascade, MiniTable } from "./sim/primitives"
import { SIM } from "./sim/colors"

const POPS = [
  { value: "newlyDiagnosed", label: "Newly diagnosed" },
  { value: "unsuppressed", label: "Not suppressed" },
  { value: "reEngaged", label: "Returned to care" },
]

const AGES = [
  { value: "0 - 4 years", label: "0-4" },
  { value: "5 - 9 years", label: "5-9" },
  { value: "10 - 14 years", label: "10-14" },
  { value: "15 - 19 years", label: "15-19" },
]

type PopMetrics = {
  identified: number
  cd4Below200: number
  malScreened: number
  malnourished: number
  malIntervention: number
  tbTested: number
  tbPositive: number
  tbTreatment: number
  cragScreened: number
  cragPositive: number
  cmTreatment: number
}

export function AHDPageContent() {
  const { queryString } = useDashboardFilters()
  const [pop, setPop] = useState("newlyDiagnosed")
  const [age, setAge] = useState("10 - 14 years")
  const [rows, setRows] = useState<any[]>([])
  const [commodities, setCommodities] = useState<any[]>([])

  useEffect(() => {
    let alive = true
    fetch(`/api/analytics/ahd${queryString}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive) return
        setRows(j?.data ?? [])
        setCommodities(j?.ahdCommodities ?? [])
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [queryString])

  const m: PopMetrics | null = useMemo(() => {
    const row = rows.find((r) => r.ageGroup === age)
    return row?.populations?.[pop] ?? null
  }, [rows, age, pop])

  const is10Plus = age === "10 - 14 years" || age === "15 - 19 years"

  const tbSteps = m
    ? [
        { label: "CD4 <200", n: m.cd4Below200 || m.identified, color: SIM.tealD },
        { label: "TB tested", n: m.tbTested, color: SIM.red },
        { label: "TB positive", n: m.tbPositive, color: SIM.teal },
        { label: "On TB treatment", n: m.tbTreatment, color: SIM.good },
      ]
    : []

  const nutSteps = m
    ? [
        { label: "CD4 <200", n: m.cd4Below200 || m.identified, color: SIM.tealD },
        { label: "MUAC screened", n: m.malScreened, color: SIM.teal },
        { label: "Malnourished", n: m.malnourished, color: SIM.gold },
        { label: "Got nutrition intervention", n: m.malIntervention, color: SIM.good },
      ]
    : []

  const menSteps = m
    ? [
        { label: "Serum CrAg tested", n: m.cragScreened, color: SIM.tealD },
        { label: "CrAg positive", n: m.cragPositive, color: SIM.teal },
        { label: "Started CM treatment", n: m.cmTreatment, color: SIM.good },
      ]
    : []

  function availStatus(available: number, unavailable: number) {
    const tot = available + unavailable
    if (tot === 0) return { text: "—", className: "mid" }
    const pct = available / tot
    if (pct < 0.5) return { text: "Stock-out", className: "bad" }
    if (pct < 0.8) return { text: "Understocked", className: "mid" }
    return { text: "Adequate", className: "ok" }
  }

  return (
    <section>
      <SecTitle>Advanced HIV disease — every step shows its gap</SecTitle>
      <div className="sim-ctrls">
        <ToggleGroup label="Population:" value={pop} options={POPS} onChange={setPop} inline />
        <ToggleGroup label="Age band:" value={age} options={AGES} onChange={setAge} inline />
      </div>

      <div className="sim-grid sim-g2">
        <SimCard title="TB cascade" desc="each step ÷ the step above · gaps flagged">
          {tbSteps.length ? <Cascade steps={tbSteps} /> : <Note>No AHD data</Note>}
        </SimCard>
        <SimCard title="Malnutrition cascade" desc="each step ÷ the step above · gaps flagged">
          {nutSteps.length ? <Cascade steps={nutSteps} /> : <Note>No AHD data</Note>}
        </SimCard>
      </div>

      <div className="sim-grid sim-g2" style={{ marginTop: 14 }}>
        <SimCard title="Meningitis — this quarter (10+ only)" desc="screening & treatment start">
          {!is10Plus ? (
            <Note>Serum CrAg is done from 10 years only — no data for this age band.</Note>
          ) : menSteps.length ? (
            <Cascade steps={menSteps} />
          ) : (
            <Note>No meningitis data</Note>
          )}
        </SimCard>
        <SimCard title="Meningitis — completion (started ~6 months ago)" desc="different cohort — not divided by this quarter">
          {!is10Plus ? (
            <Note>Meningitis completion applies to 10+ only.</Note>
          ) : (
            <Note warn>
              Completion cohort fields are not fully captured in the current ODK extract — pathway above uses this
              quarter&apos;s CrAg / CM start counts.
            </Note>
          )}
        </SimCard>
      </div>

      <SecTitle>AHD supplies — availability status (like the pALD commodities)</SecTitle>
      <SimCard title="Supply availability by item" desc="availability status — sites reporting available vs not">
        <MiniTable
          headers={["Item", "Status", "Sites available", "Sites unavailable"]}
          rows={
            commodities.length
              ? commodities.map((c) => {
                  const st = availStatus(c.available ?? 0, c.unavailable ?? 0)
                  return [c.item, st, String(c.available ?? 0), String(c.unavailable ?? 0)]
                })
              : [["No supply data", { text: "—", className: "mid" }, "—", "—"]]
          }
        />
      </SimCard>
    </section>
  )
}
