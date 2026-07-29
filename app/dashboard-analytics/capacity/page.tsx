import { redirect } from "next/navigation"

/** Capacity & Retention was removed; content moved to Integration and Viral Load tabs. */
export default function CapacityPage() {
  redirect("/dashboard-analytics/integration")
}
