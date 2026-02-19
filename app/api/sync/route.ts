import { NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/auth"
import { syncOdkToDatabase } from "@/lib/odkSync"

export async function POST(req: Request) {
  const auth = getAuthFromRequest(req)

  // Only allow admins and national users to trigger a full sync
  if (!auth || (auth.role !== "ADMIN" && auth.role !== "NATIONAL")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncOdkToDatabase()
    return NextResponse.json(
      {
        status: "ok",
        processed: result.processed,
        lastSubmissionDate: result.lastSubmissionDate,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sync from ODK"
    console.error("[api/sync]", error)
    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 500 },
    )
  }
}

