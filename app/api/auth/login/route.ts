import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { signToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const { email, password } = (body ?? {}) as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      jurisdictionLevel: user.jurisdictionLevel,
      region: user.region,
      district: user.district,
      facility: user.facility,
    })

    const res = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          jurisdictionLevel: user.jurisdictionLevel,
          region: user.region,
          district: user.district,
          facility: user.facility,
        },
      },
      { status: 200 },
    )

    // Set httpOnly cookie so dashboard and other same-origin requests get auth automatically
    res.cookies.set("pead-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60, // 8h, match JWT expiry
    })

    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed"
    console.error("[auth/login]", err)
    return NextResponse.json(
      { error: "Internal server error", details: process.env.NODE_ENV === "development" ? message : undefined },
      { status: 500 },
    )
  }
}

