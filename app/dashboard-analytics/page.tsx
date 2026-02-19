import type { Metadata } from "next"
import PALDPageContent from "@/components/analytics/pald-page-content"
import Layout from "@/components/cmsfullform/layout"

export const metadata: Metadata = {
  title: "pALD & CALHIV Dashboard | Pediatric & Adolescent HIV Integration",
  description: "pALD transition, CALHIV in care, weight bands, care models, and integration metrics.",
}

export default function AnalyticsDashboardPage() {
  return (
    <Layout>
      <PALDPageContent />
    </Layout>
  )
}
