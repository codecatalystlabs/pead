"use client"

import Link from "next/link"
import { SummaryCards } from "./summary-cards"
import { CareModelDistribution } from "./care-model-distribution"
import { TransitionTrends } from "./transition-trends"
import { PALDTransitionDetails } from "./pald-transition-details"
import { WeightBandDistribution } from "./weight-band-distribution"
import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { PALDDataContext } from "./pald-data-context"

export default function PALDPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            pALD &amp; CALHIV Overview
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Pediatric and adolescent HIV integration: CALHIV in care, pALD transition, weight bands, and care models.
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

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <CareModelDistribution />
        <TransitionTrends />
      </div>

      <PALDTransitionDetails />

      <WeightBandDistribution />
    </div>
  )
}
