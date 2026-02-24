"use client"

import { Heart, Shield, BarChart3, Users2, Droplets } from "lucide-react"

// Optional: set NEXT_PUBLIC_HIV_INTERVENTION_IMAGE and NEXT_PUBLIC_HIV_DATA_USE_IMAGE in .env to use your own images (e.g. /images/hiv-intervention.jpg)
const HIV_INTERVENTION_IMAGE =
  process.env.NEXT_PUBLIC_HIV_INTERVENTION_IMAGE ||
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80"
const HIV_DATA_USE_IMAGE =
  process.env.NEXT_PUBLIC_HIV_DATA_USE_IMAGE ||
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"

export function PaldLoginBrand() {
  const pattern =
    "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M20 20m-1 0a1 1 0 1 1 2 0a1 1 0 1 1 -2 0' fill='%23ffffff' fillOpacity='0.08'/%3E%3C/svg%3E"

  return (
    <div
      className="hidden lg:flex lg:w-[52%] h-full min-h-0 relative overflow-hidden flex-shrink-0"
      style={{
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 40%, #0c4a6e 70%, #0f172a 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("${pattern}")` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-cyan-500/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col justify-center min-h-0 h-full px-10 py-6 text-white overflow-hidden">
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Heart className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">pALD Integration</h1>
            <p className="text-cyan-200/90 text-xs font-medium">Pediatric &amp; Adolescent HIV</p>
          </div>
        </div>

        <h2 className="text-xl font-bold leading-tight mb-2 max-w-lg flex-shrink-0">
          One dashboard for CALHIV care integration
        </h2>
        <p className="text-sm text-slate-300 leading-snug max-w-md mb-4 flex-shrink-0">
          Track pALD transition, viral load, AHD screening, and facility capacity in one place.
        </p>

        <ul className="space-y-2 mb-4 flex-shrink-0">
          <li className="flex items-start gap-2">
            <span className="w-7 h-7 rounded-md bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-300" />
            </span>
            <div className="min-w-0">
              <span className="font-semibold text-white text-sm">Viral load &amp; pALD</span>
              <p className="text-slate-400 text-xs mt-0.5">Outcomes by age and weight band.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-7 h-7 rounded-md bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-teal-300" />
            </span>
            <div className="min-w-0">
              <span className="font-semibold text-white text-sm">AHD &amp; commodities</span>
              <p className="text-slate-400 text-xs mt-0.5">DSD/MMD, stock visibility.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-7 h-7 rounded-md bg-slate-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users2 className="w-3.5 h-3.5 text-slate-300" />
            </span>
            <div className="min-w-0">
              <span className="font-semibold text-white text-sm">Capacity &amp; retention</span>
              <p className="text-slate-400 text-xs mt-0.5">Staff training, analytics.</p>
            </div>
          </li>
        </ul>

        {/* HIV intervention & data use images */}
        <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
          <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5">
            <div className="relative h-16 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HIV_INTERVENTION_IMAGE}
                alt="HIV intervention"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="px-2 py-1 text-[10px] font-medium text-cyan-200/90 bg-white/5">HIV intervention</p>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5">
            <div className="relative h-16 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HIV_DATA_USE_IMAGE}
                alt="HIV data use"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="px-2 py-1 text-[10px] font-medium text-cyan-200/90 bg-white/5">HIV data use</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-white/10 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white text-xs">CALHIV Dashboard</p>
            <p className="text-slate-400 text-[10px]">ODK Central • Role-based access</p>
          </div>
        </div>
      </div>
    </div>
  )
}
