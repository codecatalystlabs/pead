import type { Metadata } from "next"
import { AnalyticsSimLayout } from "@/components/analytics/sim/AnalyticsSimLayout"
import { PaldPageContent } from "@/components/analytics/pald-page-content"

export const metadata: Metadata = {
  title: "pALD, treatment line & commodities | Paediatric HIV",
  description: "pALD transition, treatment lines, and commodity stock-out days.",
}

export default function PaldPage() {
  return (
    <AnalyticsSimLayout>
      <PaldPageContent />
    </AnalyticsSimLayout>
  )
}
