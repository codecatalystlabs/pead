"use client"

import { useCallback, useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RotateCcw } from "lucide-react"

interface FilterOptions {
  region: string[]
  district: string[]
  facility: string[]
  reportingPeriod: string[]
}

export function DashboardFilterBar() {
  const { filters, setFilters, resetFilters } = useDashboardFilters()
  const [options, setOptions] = useState<FilterOptions>({ region: [], district: [], facility: [], reportingPeriod: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetch("/api/analytics/filter-options", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!isMounted) return
        setOptions({
          region: data.region ?? [],
          district: data.district ?? [],
          facility: data.facility ?? [],
          reportingPeriod: data.reportingPeriod ?? [],
        })
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  const update = useCallback(
    (key: keyof typeof filters, value: string) => {
      setFilters({ [key]: value })
    },
    [setFilters],
  )

  if (loading) return null

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 pl-6 overflow-x-auto">
      <div className="flex flex-wrap items-end gap-4 justify-end min-w-0">
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Region</Label>
          <Select value={filters.region || "all"} onValueChange={(v) => update("region", v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              {options.region.map((r) => (
                <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">District</Label>
          <Select value={filters.district || "all"} onValueChange={(v) => update("district", v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              {options.district.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Facility</Label>
          <Select value={filters.facility || "all"} onValueChange={(v) => update("facility", v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              {options.facility.map((f) => (
                <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Period</Label>
          <Select value={filters.reportingPeriod || "all"} onValueChange={(v) => update("reportingPeriod", v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              {options.reportingPeriod.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">From</Label>
          <Input
            type="date"
            className="h-8 w-[130px] text-xs"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">To</Label>
          <Input
            type="date"
            className="h-8 w-[130px] text-xs"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={resetFilters}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  )
}
