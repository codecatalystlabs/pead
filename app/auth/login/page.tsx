import type { Metadata } from "next"
import { PaldLoginBrand } from "@/components/auth/pald-login-brand"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in | pALD & CALHIV Dashboard",
  description:
    "Sign in to the Pediatric & Adolescent HIV Integration Dashboard. Track pALD transition, viral load, AHD screening, and facility capacity.",
}

export default function LoginPage() {
  return (
    <div className="h-screen min-h-screen max-h-screen flex flex-col lg:flex-row overflow-hidden">
      <PaldLoginBrand />
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50/80 overflow-hidden">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
