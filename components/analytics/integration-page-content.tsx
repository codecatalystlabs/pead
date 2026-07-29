"use client"

import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { CareModelDistribution } from "./care-model-distribution"
import { CapacityMetrics } from "./capacity-metrics"
import { IntegrationNarrative } from "./integration-narrative"
import { IntegrationServices } from "./integration-services"

export function IntegrationPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Integration and Capacity Building
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Care model mix, service integration status, staff training by cadre, mentorship and support supervision.
        </p>
      </div>
      <DashboardNav />
      <DashboardFilterBar />
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <CareModelDistribution />
        <IntegrationServices />
      </div>
      <CapacityMetrics />
      <IntegrationNarrative />
    </div>
  )
}
