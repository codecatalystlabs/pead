import type { Metadata } from "next"
import { AnalyticsSimLayout } from "@/components/analytics/sim/AnalyticsSimLayout"
import { DsdMmdPageContent } from "@/components/analytics/dsd-mmd-page-content"

export const metadata: Metadata = {
  title: "DSD & MMD | Paediatric HIV",
  description: "Multi-month dispensing and differentiated service delivery models.",
}

export default function DsdMmdPage() {
  return (
    <AnalyticsSimLayout>
      <DsdMmdPageContent />
    </AnalyticsSimLayout>
  )
}
