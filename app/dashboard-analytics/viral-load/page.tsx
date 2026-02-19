import type { Metadata } from "next"
import Layout from "@/components/cmsfullform/layout"
import { ViralLoadPageContent } from "@/components/analytics/viral-load-page-content"

export const metadata: Metadata = {
  title: "Viral Load & IAC/LLV | CALHIV Dashboard",
  description: "Viral load coverage and suppression, HLV & IAC cascade, LLV follow-up.",
}

export default function ViralLoadPage() {
  return (
    <Layout>
      <ViralLoadPageContent />
    </Layout>
  )
}
