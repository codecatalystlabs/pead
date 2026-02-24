"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? `Login failed (${res.status})`)
        setIsLoading(false)
        return
      }
      window.location.href = "/dashboard-analytics"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto py-2">
      <div className="lg:hidden flex items-center gap-2 mb-4 justify-center flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
          <span className="text-xl">❤️</span>
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">pALD Integration</p>
          <p className="text-[10px] text-slate-500">Pediatric &amp; Adolescent HIV</p>
        </div>
      </div>

      <div className="text-center lg:text-left mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-0.5">Sign in</h2>
        <p className="text-slate-600 text-xs">Access the CALHIV Health Facility Dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-slate-700">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="pl-9 h-10 border-slate-200 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-slate-700">Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="pl-9 pr-9 h-10 border-slate-200 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))}
            />
            <Label htmlFor="remember" className="text-sm text-slate-600 font-normal cursor-pointer">
              Remember me
            </Label>
          </div>
          <Link href="/auth/forgot" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium focus:ring-2 focus:ring-cyan-500/30"
          disabled={isLoading}
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-[10px] text-slate-500">
        Authorized users only. Contact your program administrator for access.
      </p>
    </div>
  )
}
