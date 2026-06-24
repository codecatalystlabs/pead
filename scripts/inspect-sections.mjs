import { PrismaClient } from "@prisma/client"

function flatten(obj, prefix = "", out = {}) {
  if (obj == null) return out
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flatten(item, prefix ? `${prefix}.${i}` : String(i), out))
    return out
  }
  if (typeof obj !== "object") return out
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v != null && typeof v === "object" && !(v instanceof Date)) flatten(v, key, out)
    else out[key] = v
  }
  return out
}

const p = new PrismaClient()
const row = await p.submission.findFirst({ orderBy: { createdAt: "desc" }, select: { data: true } })
const f = flatten(row?.data ?? {})
const keys = Object.keys(f).sort()
for (const prefix of ["Section_A", "Section_E", "section_E", "SectionG", "section_H", "Section_L", "section_K"]) {
  const matched = keys.filter((k) => k.toLowerCase().startsWith(prefix.toLowerCase()))
  console.log(`\n## ${prefix} (${matched.length})`)
  for (const k of matched) console.log(k, "=", f[k])
}
await p.$disconnect()
