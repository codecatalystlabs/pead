"use client"

import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { PALDTransitionDetails } from "./pald-transition-details"
import { TransitionTrends } from "./transition-trends"
import { WeightBandDistribution } from "./weight-band-distribution"
import { ARVCommodityStatus } from "./arv-commodity-status"
import { RegimenLineStatus } from "./regimen-line-status"
import { PaldCascade } from "./pald-cascade"

export function PaldPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          pALD, ARV Line and Commodity Availability
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          pALD transition by age and weight, first/second/third-line regimens, and commodity stock-out days.
        </p>
      </div>
      <DashboardNav />
      <DashboardFilterBar />
      <PaldCascade />
      {/* Weight + age side by side; trends full width below — avoids nested grids that overflow */}
      <PALDTransitionDetails />
      <TransitionTrends />
      <WeightBandDistribution showEligibility />
      <RegimenLineStatus />
      <ARVCommodityStatus />
    </div>
  )
}
