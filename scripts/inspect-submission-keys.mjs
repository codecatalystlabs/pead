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
const rows = await p.submission.findMany({ take: 5, select: { id: true, data: true } })
console.log("submission_count_sample", rows.length)
for (const row of rows) {
  const flat = flatten(row.data)
  const keys = Object.keys(flat).sort()
  console.log("\n===", row.id, "keys", keys.length, "===")
  for (const k of keys) {
    const v = flat[k]
    if (typeof v === "number" || (typeof v === "string" && /^\d+$/.test(v))) {
      console.log(k, "=", v)
    }
  }
  console.log("\n-- top-level groups --")
  const groups = new Set(keys.map((k) => k.split(".")[0]))
  console.log([...groups].sort().join(", "))
}
await p.$disconnect()
