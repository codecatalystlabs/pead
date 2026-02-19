import jwt from "jsonwebtoken"

export type JwtRole = "ADMIN" | "NATIONAL" | "REGIONAL" | "DISTRICT" | "FACILITY"

export interface AuthClaims {
  sub: number
  email: string
  role: JwtRole
  jurisdictionLevel: JwtRole
  region?: string | null
  district?: string | null
  facility?: string | null
}

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  // In dev this will help surface misconfiguration quickly
  console.warn("JWT_SECRET is not set – authentication will not work correctly.")
}

export function signToken(payload: AuthClaims, expiresIn: string = "8h"): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured")
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): AuthClaims {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured")
  }
  return jwt.verify(token, JWT_SECRET) as AuthClaims
}

const AUTH_COOKIE_NAME = "pead-auth"

export function getAuthFromRequest(req: Request): AuthClaims | null {
  let token: string | null = null
  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (auth?.startsWith("Bearer ")) {
    token = auth.slice("Bearer ".length).trim()
  } else {
    const cookie = req.headers.get("cookie")
    if (cookie) {
      const match = cookie.match(new RegExp(`(?:^|;)\\s*${AUTH_COOKIE_NAME}=([^;]+)`))
      if (match) token = decodeURIComponent(match[1].trim())
    }
  }
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME
}

