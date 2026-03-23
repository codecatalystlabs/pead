"use client"

import { useCallback, useEffect, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Check, ChevronsUpDown, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [openRegion, setOpenRegion] = useState(false)
  const [permissions, setPermissions] = useState<{ canSync: boolean; canExport: boolean; canManageTeam: boolean } | null>(null)
  const [syncing, setSyncing] = useState(false)

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

  useEffect(() => {
    let isMounted = true
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!isMounted) return
        setPermissions(data.permissions ?? null)
      })
      .catch(() => {
        if (!isMounted) return
        setPermissions(null)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const update = useCallback(
    (key: keyof typeof filters, value: string) => {
      setFilters({ [key]: value })
    },
    [setFilters],
  )

  if (loading) return null

  const query = new URLSearchParams()
  if (filters.region) query.set("region", filters.region)
  if (filters.district) query.set("district", filters.district)
  if (filters.facility) query.set("facility", filters.facility)
  if (filters.ageBand) query.set("ageBand", filters.ageBand)
  if (filters.reportingPeriod) query.set("reportingPeriod", filters.reportingPeriod)
  if (filters.dateFrom) query.set("dateFrom", filters.dateFrom)
  if (filters.dateTo) query.set("dateTo", filters.dateTo)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 pl-6 overflow-x-auto">
      <div className="flex flex-wrap items-end gap-4 justify-end min-w-0">
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Region</Label>
          <Popover open={openRegion} onOpenChange={setOpenRegion}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openRegion}
                className="h-8 w-[170px] justify-between text-xs font-normal"
              >
                {filters.region || "All"}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search region..." />
                <CommandList>
                  <CommandEmpty>No region found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="All"
                      onSelect={() => {
                        update("region", "")
                        setOpenRegion(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-3 w-3", !filters.region ? "opacity-100" : "opacity-0")} />
                      All
                    </CommandItem>
                    {options.region.map((r) => (
                      <CommandItem
                        key={r}
                        value={r}
                        onSelect={() => {
                          update("region", r)
                          setOpenRegion(false)
                        }}
                      >
                        <Check className={cn("mr-2 h-3 w-3", filters.region === r ? "opacity-100" : "opacity-0")} />
                        {r}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
          <Label className="text-xs whitespace-nowrap">Age band</Label>
          <Select value={filters.ageBand || "all"} onValueChange={(v) => update("ageBand", v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              <SelectItem value="0-4" className="text-xs">0-4</SelectItem>
              <SelectItem value="5-9" className="text-xs">5-9</SelectItem>
              <SelectItem value="10-14" className="text-xs">10-14</SelectItem>
              <SelectItem value="15-19" className="text-xs">15-19</SelectItem>
              <SelectItem value="20-24" className="text-xs">20-24</SelectItem>
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
        <Select
          value={filters.metricView}
          onValueChange={(v) => update("metricView", v === "absolute" ? "absolute" : "percentage")}
        >
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue placeholder="Metric view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage" className="text-xs">View: Percentage</SelectItem>
            <SelectItem value="absolute" className="text-xs">View: Absolute</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={async () => {
            if (!permissions?.canSync || syncing) return
            setSyncing(true)
            try {
              await fetch("/api/sync", { method: "POST", credentials: "include" })
              window.location.reload()
            } finally {
              setSyncing(false)
            }
          }}
          disabled={!permissions?.canSync || syncing}
          title={permissions?.canSync ? "Run ODK sync and refresh dashboard" : "Only admin/editor can sync"}
        >
          {syncing ? "Syncing..." : "Sync / Refresh"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={async () => {
            const res = await fetch(`/api/analytics/summary?${query.toString()}`, { credentials: "include", cache: "no-store" })
            if (!res.ok) return
            const data = await res.json()
            const rows = [
              ["Metric", "Value"],
              ["Total CALHIV", String(data.totalCalhiv ?? 0)],
              ["Care Integration %", String(data.careIntegrationRate ?? 0)],
              ["pALD Transition %", String(data.paldTransitionRate ?? 0)],
              ["VL Suppression %", String(data.vlSuppressionRate ?? 0)],
              ["Staff Training %", String(data.staffTrainingCoverage ?? 0)],
            ]
            const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "dashboard-summary.csv"
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }}
          disabled={permissions ? !permissions.canExport : false}
        >
          Export CSV
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => window.print()}>
          Export PDF
        </Button>
        {permissions?.canManageTeam && (
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Team admin
          </Button>
        )}
      </div>
    </div>
  )
}
