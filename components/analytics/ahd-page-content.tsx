"use client"

import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { AHDScreening } from "./ahd-screening"

export function AHDPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Advanced HIV Disease (AHD) Screening
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          CD4, TB screening, CRAG for 10+ years, malnutrition assessment by age group.
        </p>
      </div>
      <DashboardNav />
      <DashboardFilterBar />
      <AHDScreening />
    </div>
  )
}
