import type { Metadata } from "next"
import Layout from "@/components/cmsfullform/layout"
import { PaldPageContent } from "@/components/analytics/pald-page-content"

export const metadata: Metadata = {
  title: "pALD, ARV Line & Commodities | CALHIV Dashboard",
  description: "pALD transition cascade, regimen lines, and commodity stock-out days.",
}

export default function PaldPage() {
  return (
    <Layout>
      <PaldPageContent />
    </Layout>
  )
}
