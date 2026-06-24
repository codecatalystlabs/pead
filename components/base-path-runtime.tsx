"use client"

import { useEffect } from "react"
import { getBasePath } from "@/lib/base-path"

export function BasePathRuntime() {
  useEffect(() => {
    const basePath = getBasePath()
    if (!basePath || typeof window === "undefined") return
    const originalFetch = window.fetch.bind(window)

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string" && input.startsWith("/api/")) {
        return originalFetch(`${basePath}${input}`, init)
      }
      return originalFetch(input as RequestInfo, init)
    }) as typeof window.fetch

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
