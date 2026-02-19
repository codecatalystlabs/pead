"use client"

import { DashboardNav } from "./dashboard-nav"
import { DashboardFilterBar } from "./dashboard-filter-bar"
import { ARVCommodityStatus } from "./arv-commodity-status"
import { MMDComponent } from "./mmd-component"
import { DSDModels } from "./dsd-models"
import { SupportServices } from "./support-services"

export function CommoditiesPageContent() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Commodities, DSD &amp; MMD
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          ARV commodity availability (including Darunavir where reported), multi-month dispensing, DSD models, support services.
        </p>
      </div>
      <DashboardNav />
      <DashboardFilterBar />
      <ARVCommodityStatus />
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <MMDComponent />
        <DSDModels />
      </div>
      <SupportServices />
    </div>
  )
}
