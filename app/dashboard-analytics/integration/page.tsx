import type { Metadata } from "next"
import { AnalyticsSimLayout } from "@/components/analytics/sim/AnalyticsSimLayout"
import { IntegrationPageContent } from "@/components/analytics/integration-page-content"

export const metadata: Metadata = {
  title: "Integration & capacity | Paediatric HIV",
  description: "Care models, services integrated, and capacity building by cadre.",
}

export default function IntegrationPage() {
  return (
    <AnalyticsSimLayout>
      <IntegrationPageContent />
    </AnalyticsSimLayout>
  )
}
