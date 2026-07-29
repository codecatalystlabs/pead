import type { Metadata } from "next"
import Layout from "@/components/cmsfullform/layout"
import { DsdMmdPageContent } from "@/components/analytics/dsd-mmd-page-content"

export const metadata: Metadata = {
  title: "DSD / MMD | CALHIV Dashboard",
  description: "Differentiated Service Delivery models and Multi-Month Dispensing by age band.",
}

export default function DsdMmdPage() {
  return (
    <Layout>
      <DsdMmdPageContent />
    </Layout>
  )
}
