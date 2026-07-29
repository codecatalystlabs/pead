import type { Metadata } from "next"
import OverviewPageContent from "@/components/analytics/overview-page-content"
import { AnalyticsSimLayout } from "@/components/analytics/sim/AnalyticsSimLayout"

export const metadata: Metadata = {
  title: "Overview | Paediatric & Adolescent HIV Integration",
  description: "Programme at a glance — CALHIV, viral load, pALD, retention.",
}

export default function AnalyticsDashboardPage() {
  return (
    <AnalyticsSimLayout>
      <OverviewPageContent />
    </AnalyticsSimLayout>
  )
}
