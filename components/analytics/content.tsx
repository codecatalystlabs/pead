"use client"
import { SummaryCards } from "./summary-cards"
import { CareModelDistribution } from "./care-model-distribution"
import { TransitionTrends } from "./transition-trends"
import { CapacityMetrics } from "./capacity-metrics"
import { ARVCommodityStatus } from "./arv-commodity-status"
import { RetentionAnalysis } from "./retention-analysis"
import { ViralLoadIndicators } from "./viral-load-indicators"
import { AHDScreening } from "./ahd-screening"

export default function AnalyticsContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">CALHIV Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Health facility performance metrics and health outcome indicators
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Care Model Distribution & Transition Trends */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <CareModelDistribution />
        <TransitionTrends />
      </div>

      {/* Capacity Metrics & ARV Commodity Status */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <CapacityMetrics />
        <ARVCommodityStatus />
      </div>

      {/* Retention Analysis & Viral Load Indicators */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <RetentionAnalysis />
        <ViralLoadIndicators />
      </div>

      {/* AHD Screening */}
      <AHDScreening />
    </div>
  )
}
