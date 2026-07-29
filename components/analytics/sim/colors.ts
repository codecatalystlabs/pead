export const SIM = {
  teal: "#1E5B73",
  tealD: "#123F52",
  gold: "#eda100",
  red: "#C0291A",
  good: "#1f8a5b",
  soft: "#7A6F60",
  blue: "#2a78d6",
  aqua: "#1baf7a",
  violet: "#4a3aa7",
  line: "#E2D6C6",
  mut: "#7A6F60",
} as const

export type CascadeStep = { label: string; n: number; color: string }
