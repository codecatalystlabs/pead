import { PrismaClient } from "@prisma/client"

function flat(o, pre = "", out = {}) {
  if (o == null) return out
  if (Array.isArray(o)) {
    o.forEach((v, i) => flat(v, pre ? `${pre}.${i}` : String(i), out))
    return out
  }
  if (typeof o !== "object") return out
  for (const [k, v] of Object.entries(o)) {
    const key = pre ? `${pre}.${k}` : k
    if (v && typeof v === "object") flat(v, key, out)
    else out[key] = v
  }
  return out
}

const p = new PrismaClient()
const row = await p.submission.findFirst({ orderBy: { createdAt: "desc" }, select: { data: true } })
const f = flat(row?.data ?? {})
const keys = Object.keys(f).sort()
const re = /stockout|days_of|first.?line|second.?line|third.?line|GMH|GMC|IMF|FBIM|CDDP|CCLAD|care_model|topics|regimen|best_practice|number_under|MMD|Availability|had_coaching|had_support|DSD|clinic_day|mixed|integrat/i
for (const k of keys.filter((k) => re.test(k))) {
  console.log(k, "=", f[k])
}
console.log("\n--- Section_D all ---")
for (const k of keys.filter((k) => k.toLowerCase().startsWith("section_d"))) console.log(k, "=", f[k])
console.log("\n--- Section_L all ---")
for (const k of keys.filter((k) => k.toLowerCase().startsWith("section_l"))) console.log(k, "=", f[k])
console.log("\n--- Section_F stock ---")
for (const k of keys.filter((k) => k.toLowerCase().startsWith("section_f") && /stock|line|darunavir|days/i.test(k))) console.log(k, "=", f[k])
await p.$disconnect()
