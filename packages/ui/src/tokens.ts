/**
 * Design tokens, copied from ../../frontend/src/styles/index.css (the web's @theme).
 * Step 4 checks every value against the design screenshots in design/ and adjusts them here only.
 */
export const colors = {
  // Customer app
  brand: "#e83e78",
  brandDark: "#c72b63",
  soft: "#fff7f9",
  warm: "#f8f5f2",
  ink: "#24212a",
  muted: "#77727d",
  line: "#f0e7eb",
  ok: "#16865b",
  danger: "#d92d45",
  tintPink: "#fde8ef",
  tintLavender: "#f1ebfb",
  tintMint: "#e6f6ee",
  tintCream: "#fdf3e1",
  tintPeach: "#fdebe3",
  tintSky: "#e5f0fb",
  tintSand: "#f1efec",

  // Vendor app
  primary: "#e91e63",
  primaryDark: "#c2185b",
  primaryLight: "#fde7ef",
  accent: "#ffb000",
  accentLight: "#fff6e0",
  bg: "#f8f8f8",
  surface: "#ffffff",
  text: "#1f1f1f",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  success: "#16a34a",
  successLight: "#eaf7ee",
  error: "#dc2626",
  errorLight: "#fdeded",
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
} as const;
