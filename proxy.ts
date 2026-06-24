import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE = "pead-auth"

export function proxy(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  const path = req.nextUrl.pathname
  const bp = req.nextUrl.basePath || ""
  const toPath = (p: string) => `${bp}${p}`

  // Public: auth pages and API
  if (path.startsWith("/api/") || path.startsWith("/auth/")) {
    if (token && (path === "/auth/login" || path === "/auth/register")) {
      return NextResponse.redirect(new URL(toPath("/dashboard-analytics"), req.url))
    }
    return NextResponse.next()
  }

  // Protected: app root and dashboard require auth
  if (path === "/" || path.startsWith("/dashboard-analytics")) {
    if (!token) {
      const login = new URL(toPath("/auth/login"), req.url)
      login.searchParams.set("from", path === "/" ? toPath("/dashboard-analytics") : toPath(path))
      return NextResponse.redirect(login)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard-analytics", "/dashboard-analytics/:path*", "/auth/login", "/auth/register"],
}
