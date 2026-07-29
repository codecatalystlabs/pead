"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const sections = [
  { href: "/dashboard-analytics", label: "Overview", exact: true },
  { href: "/dashboard-analytics/pald", label: "Paediatric formulation, treatment line & commodities" },
  { href: "/dashboard-analytics/integration", label: "Integration and capacity building" },
  { href: "/dashboard-analytics/viral-load", label: "Retention, viral load and viraemia" },
  { href: "/dashboard-analytics/ahd", label: "Advanced HIV disease screening & supplies" },
  { href: "/dashboard-analytics/dsd-mmd", label: "Differentiated service delivery & multi-month dispensing" },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="sim-nav" role="tablist">
      {sections.map((s) => {
        const active = s.exact
          ? pathname === s.href || pathname === `${s.href}/`
          : pathname === s.href || pathname.startsWith(`${s.href}/`)
        return (
          <Link key={s.href} href={s.href} className="sim-tab" data-active={active ? "true" : "false"} role="tab">
            {s.label}
          </Link>
        )
      })}
    </nav>
  )
}
