import { NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/auth"

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isAdmin = auth.role === "ADMIN"
  const isEditor = auth.role === "ADMIN" || auth.role === "NATIONAL"

  return NextResponse.json(
    {
      user: {
        email: auth.email,
        role: auth.role,
        jurisdictionLevel: auth.jurisdictionLevel,
      },
      permissions: {
        canSync: isEditor,
        canExport: true,
        canManageTeam: isAdmin,
      },
    },
    { status: 200 },
  )
}
