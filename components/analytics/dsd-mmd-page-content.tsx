"use client"

import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { MMDComponent } from "./mmd-component"
import { DSDModels } from "./dsd-models"
import { SupportServices } from "./support-services"
import { BestPracticesPanel } from "./best-practices-panel"

export function DsdMmdPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Differentiated Service Delivery (DSD) and Multi-Month Dispensing (MMD)
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Multi-Month Dispensing by age band and Differentiated Service Delivery models, plus support services.
        </p>
      </div>
      <DashboardNav />
      <DashboardFilterBar />
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <MMDComponent />
        <DSDModels />
      </div>
      <SupportServices />
      <BestPracticesPanel />
    </div>
  )
}
