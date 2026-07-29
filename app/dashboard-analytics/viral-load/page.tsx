import type { Metadata } from "next"
import { AnalyticsSimLayout } from "@/components/analytics/sim/AnalyticsSimLayout"
import { ViralLoadPageContent } from "@/components/analytics/viral-load-page-content"

export const metadata: Metadata = {
  title: "Retention, viral load & viraemia | Paediatric HIV",
  description: "Retention, viral load coverage/suppression, HLV and LLV pathways.",
}

export default function ViralLoadPage() {
  return (
    <AnalyticsSimLayout>
      <ViralLoadPageContent />
    </AnalyticsSimLayout>
  )
}
