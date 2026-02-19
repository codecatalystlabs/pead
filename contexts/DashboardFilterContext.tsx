"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "pead-dashboard-filters"

export interface DashboardFilters {
  region: string
  district: string
  facility: string
  reportingPeriod: string
  dateFrom: string
  dateTo: string
}

const defaultFilters: DashboardFilters = {
  region: "",
  district: "",
  facility: "",
  reportingPeriod: "",
  dateFrom: "",
  dateTo: "",
}

function loadStored(): DashboardFilters {
  if (typeof window === "undefined") return defaultFilters
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultFilters
    const parsed = JSON.parse(raw) as Partial<DashboardFilters>
    return { ...defaultFilters, ...parsed }
  } catch {
    return defaultFilters
  }
}

function saveStored(f: DashboardFilters) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(f))
  } catch {}
}

type SetFilters = (patch: Partial<DashboardFilters>) => void
type ResetFilters = () => void

const DashboardFilterContext = createContext<{
  filters: DashboardFilters
  setFilters: SetFilters
  resetFilters: ResetFilters
  queryString: string
} | null>(null)

export function DashboardFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<DashboardFilters>(defaultFilters)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setFiltersState(loadStored())
    setHydrated(true)
  }, [])

  const setFilters = useCallback((patch: Partial<DashboardFilters>) => {
    setFiltersState((prev) => {
      const next = { ...prev, ...patch }
      saveStored(next)
      return next
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    saveStored(defaultFilters)
  }, [])

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    if (filters.region) p.set("region", filters.region)
    if (filters.district) p.set("district", filters.district)
    if (filters.facility) p.set("facility", filters.facility)
    if (filters.reportingPeriod) p.set("reportingPeriod", filters.reportingPeriod)
    if (filters.dateFrom) p.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) p.set("dateTo", filters.dateTo)
    const s = p.toString()
    return s ? `?${s}` : ""
  }, [filters])

  const value = useMemo(
    () => ({ filters, setFilters, resetFilters, queryString }),
    [filters, setFilters, resetFilters, queryString],
  )

  if (!hydrated) {
    return (
      <DashboardFilterContext.Provider value={value}>
        {children}
      </DashboardFilterContext.Provider>
    )
  }

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  )
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFilterContext)
  if (!ctx) throw new Error("useDashboardFilters must be used within DashboardFilterProvider")
  return ctx
}
