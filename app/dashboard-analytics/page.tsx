import type { Metadata } from "next"
import OverviewPageContent from "@/components/analytics/overview-page-content"
import Layout from "@/components/cmsfullform/layout"

export const metadata: Metadata = {
  title: "Overview | Pediatric & Adolescent HIV Integration Dashboard",
  description: "Key CALHIV, pALD, integration, viral load, AHD, and DSD/MMD indicators.",
}

export default function AnalyticsDashboardPage() {
  return (
    <Layout>
      <OverviewPageContent />
    </Layout>
  )
}
