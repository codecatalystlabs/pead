"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useDashboardFilters } from "@/contexts/DashboardFilterContext"

type CascadeRow = { region: string; district: string; facility: string }

interface FilterOptions {
  region: string[]
  district: string[]
  facility: string[]
  reportingPeriod: string[]
  cascade: CascadeRow[]
}

export function DashboardFilterBar() {
  const { filters, setFilters, resetFilters } = useDashboardFilters()
  const [options, setOptions] = useState<FilterOptions>({
    region: [],
    district: [],
    facility: [],
    reportingPeriod: [],
    cascade: [],
  })
  const [permissions, setPermissions] = useState<{ canSync: boolean; canExport: boolean } | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let alive = true
    fetch("/api/analytics/filter-options", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!alive) return
        setOptions({
          region: data.region ?? [],
          district: data.district ?? [],
          facility: data.facility ?? [],
          reportingPeriod: data.reportingPeriod ?? [],
          cascade: data.cascade ?? [],
        })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => alive && setPermissions(data?.permissions ?? null))
      .catch(() => alive && setPermissions(null))
    return () => {
      alive = false
    }
  }, [])

  const cascade = options.cascade

  const regionOptions = useMemo(() => {
    if (cascade.length) {
      return [...new Set(cascade.map((c) => c.region).filter(Boolean))].sort()
    }
    return options.region
  }, [cascade, options.region])

  const districtOptions = useMemo(() => {
    if (!cascade.length) return options.district
    if (!filters.region) return []
    const rows = cascade.filter((c) => c.region === filters.region)
    return [...new Set(rows.map((c) => c.district).filter(Boolean))].sort()
  }, [cascade, filters.region, options.district])

  const facilityOptions = useMemo(() => {
    if (!cascade.length) return options.facility
    if (!filters.region) return []
    const rows = cascade.filter((c) => {
      if (c.region !== filters.region) return false
      if (filters.district && c.district !== filters.district) return false
      return true
    })
    return [...new Set(rows.map((c) => c.facility).filter(Boolean))].sort()
  }, [cascade, filters.region, filters.district, options.facility])

  // Clear child filters when parent selection makes them invalid
  useEffect(() => {
    if (!cascade.length) return
    const patch: Partial<typeof filters> = {}
    if (!filters.region && (filters.district || filters.facility)) {
      patch.district = ""
      patch.facility = ""
    } else if (filters.district && !districtOptions.includes(filters.district)) {
      patch.district = ""
      patch.facility = ""
    } else if (filters.facility && !facilityOptions.includes(filters.facility)) {
      patch.facility = ""
    }
    if (Object.keys(patch).length) setFilters(patch)
  }, [
    cascade.length,
    districtOptions,
    facilityOptions,
    filters.region,
    filters.district,
    filters.facility,
    setFilters,
  ])

  const onRegionChange = useCallback(
    (region: string) => {
      setFilters({ region, district: "", facility: "" })
    },
    [setFilters],
  )

  const onDistrictChange = useCallback(
    (district: string) => {
      setFilters({ district, facility: "" })
    },
    [setFilters],
  )

  const onFacilityChange = useCallback(
    (facility: string) => {
      setFilters({ facility })
    },
    [setFilters],
  )

  const update = useCallback(
    (key: keyof typeof filters, value: string) => setFilters({ [key]: value }),
    [setFilters],
  )

  return (
    <div className="sim-filters">
      <label>
        Region
        <select value={filters.region} onChange={(e) => onRegionChange(e.target.value)}>
          <option value="">All</option>
          {regionOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label>
        District
        <select
          value={filters.district}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!filters.region}
          title={filters.region ? "Districts in the selected region" : "Select a region first"}
        >
          <option value="">{filters.region ? "All districts in region" : "Select region first"}</option>
          {districtOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label>
        Facility
        <select
          value={filters.facility}
          onChange={(e) => onFacilityChange(e.target.value)}
          disabled={!filters.region}
          title={
            !filters.region
              ? "Select a region first"
              : filters.district
                ? "Facilities in the selected district"
                : "Facilities in the selected region (or pick a district to narrow)"
          }
        >
          <option value="">
            {!filters.region
              ? "Select region first"
              : filters.district
                ? "All facilities in district"
                : "All facilities in region"}
          </option>
          {facilityOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label>
        Age band
        <select value={filters.ageBand} onChange={(e) => update("ageBand", e.target.value)}>
          <option value="">All</option>
          <option value="0-4">0–4</option>
          <option value="5-9">5–9</option>
          <option value="10-14">10–14</option>
          <option value="15-19">15–19</option>
        </select>
      </label>
      <label>
        Period
        <select value={filters.reportingPeriod} onChange={(e) => update("reportingPeriod", e.target.value)}>
          <option value="">All</option>
          {options.reportingPeriod.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <span style={{ flex: 1 }} />
      <span>
        Cascade: region → district → facility
      </span>
      <button type="button" className="f" onClick={resetFilters}>
        Reset
      </button>
      {permissions?.canSync ? (
        <button
          type="button"
          className="f"
          disabled={syncing}
          onClick={async () => {
            setSyncing(true)
            try {
              await fetch("/api/sync", { method: "POST", credentials: "include" })
              window.location.reload()
            } finally {
              setSyncing(false)
            }
          }}
        >
          {syncing ? "Syncing…" : "Sync"}
        </button>
      ) : null}
    </div>
  )
}
