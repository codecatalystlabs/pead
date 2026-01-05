import type { Metadata } from "next"
import Content from "@/components/analytics/content"
import Layout from "@/components/cmsfullform/layout"

export const metadata: Metadata = {
  title: "CALHIV Analytics Dashboard",
  description: "Health facility analytics and performance metrics",
}

export default function AnalyticsDashboardPage() {
  return (
    <Layout>
      <Content />
    </Layout>
  )
}
