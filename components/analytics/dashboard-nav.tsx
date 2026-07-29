"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Pill, GitMerge, Droplets, Activity, Package, BookOpen } from "lucide-react"
import { Tabs, TabsList } from "@/components/ui/tabs"

const sections = [
  { href: "/dashboard-analytics", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard-analytics/pald", label: "pALD, ARV Line & Commodities", icon: Pill },
  { href: "/dashboard-analytics/integration", label: "Integration & Capacity Building", icon: GitMerge },
  { href: "/dashboard-analytics/viral-load", label: "Viral Load, HLV & LLV", icon: Droplets },
  { href: "/dashboard-analytics/ahd", label: "AHD Screening", icon: Activity },
  { href: "/dashboard-analytics/dsd-mmd", label: "DSD / MMD", icon: Package },
  { href: "/dashboard-analytics/overview", label: "Guide", icon: BookOpen },
]

export function DashboardNav() {
  const pathname = usePathname()
  const active = sections.find((s) => {
    if (s.href === "/dashboard-analytics") return pathname === "/dashboard-analytics"
    return pathname === s.href || pathname.startsWith(`${s.href}/`)
  })?.href

  return (
    <Tabs value={active}>
      <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-2 rounded-lg border border-gray-200 bg-transparent p-2 dark:border-gray-700">
        {sections.map(({ href, label, icon: Icon }) => {
          const isActive = active === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
