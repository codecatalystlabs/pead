import type { Metadata } from "next"
import Layout from "@/components/cmsfullform/layout"
import { IntegrationPageContent } from "@/components/analytics/integration-page-content"

export const metadata: Metadata = {
  title: "Integration & Capacity Building | CALHIV Dashboard",
  description: "Care models, integration status, and staff training by cadre.",
}

export default function IntegrationPage() {
  return (
    <Layout>
      <IntegrationPageContent />
    </Layout>
  )
}
