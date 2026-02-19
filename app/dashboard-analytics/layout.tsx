import { DashboardFilterProvider } from "@/contexts/DashboardFilterContext"

export default function DashboardAnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardFilterProvider>{children}</DashboardFilterProvider>
}
