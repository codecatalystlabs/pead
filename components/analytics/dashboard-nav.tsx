"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Pill, Activity, Droplets, Package, Users, BookOpen } from "lucide-react"
import { Tabs, TabsList } from "@/components/ui/tabs"

const sections = [
  { href: "/dashboard-analytics", label: "pALD & Overview", icon: Pill },
  { href: "/dashboard-analytics/viral-load", label: "Viral Load & IAC/LLV", icon: Droplets },
  { href: "/dashboard-analytics/ahd", label: "AHD Screening", icon: Activity },
  { href: "/dashboard-analytics/commodities", label: "Commodities & DSD/MMD", icon: Package },
  { href: "/dashboard-analytics/capacity", label: "Capacity & Retention", icon: Users },
  { href: "/dashboard-analytics/overview", label: "Guide", icon: BookOpen },
]

export function DashboardNav() {
  const pathname = usePathname()
  return (
    <Tabs value={sections.find((s) => pathname === s.href || (s.href !== "/dashboard-analytics" && pathname.startsWith(s.href)))?.href}>
      <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-2 rounded-lg border border-gray-200 bg-transparent p-2 dark:border-gray-700">
        {sections.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || (href !== "/dashboard-analytics" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </TabsList>
    </Tabs>
  )
}
