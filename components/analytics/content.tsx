"use client"
import Link from "next/link"
import { SummaryCards } from "./summary-cards"
import { CareModelDistribution } from "./care-model-distribution"
import { TransitionTrends } from "./transition-trends"
import { CapacityMetrics } from "./capacity-metrics"
import { ARVCommodityStatus } from "./arv-commodity-status"
import { RetentionAnalysis } from "./retention-analysis"
import { ViralLoadIndicators } from "./viral-load-indicators"
import { AHDScreening } from "./ahd-screening"
import { HLVIACCascade } from "./hlv-iac-cascade"
import { LLVFollowUp } from "./llv-followup"
import { DSDMMD } from "./dsd-mmd"
import { WeightBandDistribution } from "./weight-band-distribution"
import { PALDTransitionDetails } from "./pald-transition-details"
import { MMDComponent } from "./mmd-component"
import { DSDModels } from "./dsd-models"
import { SupportServices } from "./support-services"

export default function AnalyticsContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Pediatric & Adolescent HIV Integration Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Overview of CALHIV in care, treatment coverage, viral load outcomes, service integration, and advanced HIV disease indicators.
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

      {/* Summary Cards */}
      <SummaryCards />

      {/* Care Model Distribution & Transition Trends */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <CareModelDistribution />
        <TransitionTrends />
      </div>

      {/* pALD Transition Details */}
      <PALDTransitionDetails />

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

      {/* Compact Visualizations Grid - Row 1 */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <WeightBandDistribution />
        <AHDScreening />
        <HLVIACCascade />
      </div>

      {/* Compact Visualizations Grid - Row 2 */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <LLVFollowUp />
        <MMDComponent />
        <DSDModels />
      </div>

      {/* Support Services */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <SupportServices />
      </div>
    </div>
  )
}
