"use client"

import type { ReactNode } from "react"
import { SimShell } from "./SimShell"
import { DashboardNav } from "../dashboard-nav"
import { DashboardFilterBar } from "../dashboard-filter-bar"

/** Simulation-style shell: flag band, dark header, cream page — no CMS sidebar. */
export function AnalyticsSimLayout({ children }: { children: ReactNode }) {
  return (
    <SimShell>
      <DashboardFilterBar />
      <DashboardNav />
      {children}
      <footer className="sim-footer">
        Paediatric &amp; Adolescent HIV Integration Dashboard · Ministry of Health Uganda
      </footer>
    </SimShell>
  )
}
