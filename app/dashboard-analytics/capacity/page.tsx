import type { Metadata } from "next"
import Layout from "@/components/cmsfullform/layout"
import { CapacityPageContent } from "@/components/analytics/capacity-page-content"

export const metadata: Metadata = {
  title: "Capacity & Retention | CALHIV Dashboard",
  description: "Capacity building, staff training, retention with transfer in/out.",
}

export default function CapacityPage() {
  return (
    <Layout>
      <CapacityPageContent />
    </Layout>
  )
}
