import type { Metadata } from "next"
import Link from "next/link"
import Layout from "@/components/cmsfullform/layout"

export const metadata: Metadata = {
  title: "Dashboard Guide – Pediatric & Adolescent HIV Integration",
  description: "Brief explanations for the key indicators and visuals in the Pediatric & Adolescent HIV Integration Dashboard.",
}

const sections = [
  {
    id: "calhiv",
    title: "CALHIV in Care & Weight Bands",
    tag: "Foundational denominator",
    description:
      "Shows how children and adolescents living with HIV are distributed by age and weight band. This underpins eligibility for pALD and helps forecast commodity needs.",
    use: ["Check if totals match EMR/paper registers", "Confirm weight bands with very low or zero counts", "Use as denominator for pALD and VL indicators"],
  },
  {
    id: "pald",
    title: "pALD Transition & Treatment Coverage",
    tag: "Optimal regimen",
    description:
      "Compares CALHIV eligible for ABC/3TC/DTG 60/30/5 mg (pALD) with those already transitioned, by weight and age bands.",
    use: ["Identify facilities/age groups with low transition percentages", "Plan targeted pALD mentorship and follow-up", "Monitor transition progress over time"],
  },
  {
    id: "care-models",
    title: "Care Models, DSD & Multi-Month Dispensing",
    tag: "Service delivery",
    description:
      "Summarizes which integration and differentiated care models are used and how many CALHIV receive 3– or 6–month dispensing.",
    use: ["Track expansion of patient-centred models (CDDP, CCLAD, teen clubs)", "Reduce congestion by shifting stable CALHIV to DSD", "Align MMD with VL suppression and stability"],
  },
  {
    id: "vl",
    title: "Viral Load Coverage, Suppression, HLV & LLV Cascades",
    tag: "Treatment outcomes",
    description:
      "Shows VL coverage and suppression by age band, and follows HLV and LLV clients through IAC sessions, suppression, or DR testing.",
    use: ["Spot age groups with low VL coverage or suppression", "Check completion of ≥3 IAC sessions for HLV/LLV", "Ensure timely DR testing and regimen switch for failures"],
  },
  {
    id: "ahd",
    title: "Advanced HIV Disease (AHD) Screening & Commodities",
    tag: "Advanced disease",
    description:
      "Summarises CD4 testing, TB and malnutrition screening, and CRAG testing for eligible age groups, linked to key AHD commodities.",
    use: ["Confirm all eligible clients are screened for AHD", "Check availability of PIMA, CRAG, TB-LAM, CTX, TPT and AHD drugs", "Use findings to trigger resupply or escalation"],
  },
  {
    id: "support",
    title: "Support Services & Retention",
    tag: "Keeping CALHIV in care",
    description:
      "Shows enrollment in psychosocial support, teen clubs and other DSD models alongside retention indicators.",
    use: ["Link poor retention to weak support services", "Scale up psychosocial and peer support where needed", "Track improvements after introducing new groups or clubs"],
  },
]

export default function AnalyticsOverviewPage() {
  return (
    <Layout>
      <main className="w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Hero / Intro */}
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                Pediatric &amp; Adolescent HIV Integration · CALHIV
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Dashboard Guide &amp; Indicator Explanations
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Use this guide to understand what each visualization on the Pediatric &amp; Adolescent HIV Integration Dashboard
                is telling you, and how to turn it into concrete action at facility and implementing-partner level.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/80 px-4 py-3 text-xs shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800 md:w-64">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Quick links
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard-analytics"
                  className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Go to main dashboard
                </Link>
                <Link
                  href="#vl"
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Viral load &amp; cascades
                </Link>
                <Link
                  href="#pald"
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  pALD transition
                </Link>
              </div>
            </div>
          </header>

          {/* Two-column layout: left = cards, right = “How to use” */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            {/* Indicator cards */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Key dashboard sections
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {sections.map((section) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className="group relative overflow-hidden rounded-2xl bg-white/90 p-4 text-sm shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-emerald-500/60 dark:bg-slate-900/70 dark:ring-slate-800"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{section.title}</h3>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                        {section.tag}
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">{section.description}</p>
                    <div className="space-y-1.5">
                      {section.use.map((item) => (
                        <div key={item} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Right column: How to use / workflow */}
            <aside className="space-y-4">
              <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">How to use this dashboard</h2>
                <ol className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">1. Start with denominators:</span>{" "}
                    Confirm CALHIV in care by age and weight bands before interpreting coverage or percentages.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">2. Check treatment quality:</span>{" "}
                    Review pALD coverage, VL coverage/suppression, and HLV/LLV cascades for each age band.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">3. Look at service delivery:</span>{" "}
                    Use DSD, MMD, and support-service visuals to understand how care is organized for CALHIV.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">4. Agree on actions:</span>{" "}
                    In QI or data review meetings, document 2–3 specific follow-up actions and owners for the next period.
                  </li>
                </ol>
              </div>

              <div className="rounded-2xl bg-emerald-600/95 p-4 text-xs text-emerald-50 shadow-md">
                <h3 className="text-sm font-semibold mb-1.5">Tip for facility teams</h3>
                <p className="mb-2">
                  Keep this page open alongside the main dashboard during review meetings. Use it as a quick “legend” so
                  everyone has a shared understanding of each visual.
                </p>
                <p className="text-emerald-100/90">
                  Over time, track how changes in care models, pALD transition, and support services show up as better
                  viral suppression and retention for CALHIV.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  )
}
