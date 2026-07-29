import type { Metadata } from "next"
import { AnalyticsSimLayout } from "@/components/analytics/sim/AnalyticsSimLayout"
import { AHDPageContent } from "@/components/analytics/ahd-page-content"

export const metadata: Metadata = {
  title: "AHD screening & supplies | Paediatric HIV",
  description: "Advanced HIV disease cascades and supply availability.",
}

export default function AhdPage() {
  return (
    <AnalyticsSimLayout>
      <AHDPageContent />
    </AnalyticsSimLayout>
  )
}
