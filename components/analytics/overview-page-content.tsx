"use client"

import Link from "next/link"
import { SummaryCards } from "./summary-cards"
import { CareModelDistribution } from "./care-model-distribution"
import { WeightBandDistribution } from "./weight-band-distribution"
import { AgeBandDistribution } from "./age-band-distribution"
import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { PALDDataContext } from "./pald-data-context"
import { ViralLoadIndicators } from "./viral-load-indicators"
import { MMDComponent } from "./mmd-component"
import { DSDModels } from "./dsd-models"
import { AhdOverviewStrip } from "./ahd-overview-strip"
import { PaldOverviewStrip } from "./pald-overview-strip"

/** Overview tab: key headline stories without deep age/weight drill-downs for pALD/MMD/DSD. */
export default function OverviewPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Key CALHIV, pALD, integration, viral load, AHD, and DSD/MMD indicators across your jurisdiction.
          </p>
          <div className="mt-2">
            <Link
              href="/dashboard-analytics/overview"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              View dashboard guide and indicator explanations
            </Link>
          </div>
        </div>
      </div>

      <DashboardNav />
      <DashboardFilterBar />
      <PALDDataContext />
      <SummaryCards />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 min-w-0">
        <AgeBandDistribution />
        <WeightBandDistribution />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 min-w-0">
        <PaldOverviewStrip />
        <CareModelDistribution />
      </div>

      <ViralLoadIndicators summaryMode />

      <AhdOverviewStrip />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 min-w-0">
        <MMDComponent overviewMode />
        <DSDModels overviewMode />
      </div>
    </div>
  )
}
