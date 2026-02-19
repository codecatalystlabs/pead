"use client"

import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { CapacityMetrics } from "./capacity-metrics"
import { RetentionAnalysis } from "./retention-analysis"

export function CapacityPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Capacity Building &amp; Retention
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Staff training coverage, retention in care with transfer in/out.
        </p>
      </div>
      <DashboardNav />
      <DashboardFilterBar />
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <CapacityMetrics />
        <RetentionAnalysis />
      </div>
    </div>
  )
}
