import type { Metadata } from "next"
import Layout from "@/components/cmsfullform/layout"
import { CommoditiesPageContent } from "@/components/analytics/commodities-page-content"

export const metadata: Metadata = {
  title: "Commodities & DSD/MMD | CALHIV Dashboard",
  description: "ARV commodity availability, MMD, DSD models, support services.",
}

export default function CommoditiesPage() {
  return (
    <Layout>
      <CommoditiesPageContent />
    </Layout>
  )
}
