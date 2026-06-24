const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function withBasePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (!BASE_PATH) return normalized
  return `${BASE_PATH}${normalized}`
}

export function getBasePath(): string {
  return BASE_PATH
}
