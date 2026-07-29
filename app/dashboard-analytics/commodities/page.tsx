import { redirect } from "next/navigation"

/** Commodities moved to pALD tab; DSD/MMD lives at /dsd-mmd. */
export default function CommoditiesPage() {
  redirect("/dashboard-analytics/dsd-mmd")
}
