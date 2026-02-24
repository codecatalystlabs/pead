import { NextResponse } from "next/server"
import { getAuthCookieName } from "@/lib/auth"

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 })
  const name = getAuthCookieName()
  res.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
