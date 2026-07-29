"use client"

import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { ViralLoadIndicators } from "./viral-load-indicators"
import { HLVIACCascade } from "./hlv-iac-cascade"
import { LLVFollowUp } from "./llv-followup"
import { RetentionAnalysis } from "./retention-analysis"

export function ViralLoadPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Viral Load, High-Level Viremia and Low-Level Viremia
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Patient retention, viral load coverage and suppression, then High-Level Viremia (HLV) and Low-Level Viremia (LLV) Intensive Adherence Counseling (IAC) cascades.
        </p>
      </div>
      <DashboardNav />
      <DashboardFilterBar />
      <RetentionAnalysis />
      <ViralLoadIndicators />
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 min-w-0">
        <HLVIACCascade />
        <LLVFollowUp />
      </div>
    </div>
  )
}
