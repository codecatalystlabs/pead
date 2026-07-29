"use client"

import { useEffect, useState, type ReactNode } from "react"
import { getBasePath } from "@/lib/base-path"
import "./sim.css"

export function SimShell({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setEmail(j?.user?.email ?? null))
      .catch(() => setEmail(null))
  }, [])

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    window.location.href = `${getBasePath()}/auth/login`
  }

  return (
    <div className="pead-sim">
      <div className="sim-flagband">
        <i style={{ background: "#1A1A1A" }} />
        <i style={{ background: "#E0A900" }} />
        <i style={{ background: "#C0291A" }} />
      </div>
      <header className="sim-top">
        <div className="sim-wrap">
          <div>
            <h1>Paediatric &amp; Adolescent HIV Integration</h1>
            <div className="sub">Live dashboard · ODK reporting tool</div>
          </div>
          <div className="sim-user">
            <span className="sim-pill">Ministry of Health · Uganda</span>
            {email ? (
              <>
                <span>{email}</span>
                <button type="button" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <div className="sim-wrap">{children}</div>
    </div>
  )
}
