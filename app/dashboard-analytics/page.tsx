import type { Metadata } from "next"
import Content from "@/components/analytics/content"
import Layout from "@/components/cmsfullform/layout"

export const metadata: Metadata = {
  title: "Pediatric & Adolescent HIV Integration Dashboard",
  description: "Comprehensive CALHIV program indicators, viral load outcomes, and service integration metrics.",
}

export default function AnalyticsDashboardPage() {
  return (
    <Layout>
      <Content />
    </Layout>
  )
}
