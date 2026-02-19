import type { Metadata } from "next"
import Layout from "@/components/cmsfullform/layout"
import { AHDPageContent } from "@/components/analytics/ahd-page-content"

export const metadata: Metadata = {
  title: "AHD Screening | CALHIV Dashboard",
  description: "Advanced HIV disease screening: CD4, TB, CRAG (10+ years), malnutrition.",
}

export default function AHDPage() {
  return (
    <Layout>
      <AHDPageContent />
    </Layout>
  )
}
