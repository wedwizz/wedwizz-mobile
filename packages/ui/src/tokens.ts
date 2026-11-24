/**
 * Design tokens. Names follow the web's theme (../../frontend/src/styles/globals.css, @theme).
 * Customer values were re-measured from the designs in design/customer on 2026-11-21 (rule 2: the design gives the style);
 * where a value differs from the web, the web's value is in the comment.
 * Vendor values are still the web's: they get checked when the vendor designs arrive.
 */
export const colors = {
  // Customer app
  brand: "#e0115f", // web #e83e78 — the designs use a deeper magenta (buttons, active tab, links, prices)
  brandDark: "#b00c4b", // web #c72b63 — pressed buttons, text on pink tints
  brandWine: "#7a0a3a", // logo "Wed" — new
  soft: "#fdf6f8", // web #fff7f9 — focused OTP box fill
  warm: "#f8f5f2",
  ink: "#141414", // web #24212a — titles and body text are near-black in the designs
  muted: "#686870", // web #77727d
  line: "#e8e8ec", // web #f0e7eb — card borders, dividers
  lineStrong: "#c4c4cc", // new — input and OTP box borders
  ok: "#16865b",
  danger: "#d92d45",
  dangerSoft: "#fdecee", // new — error icon circle (web bg-red-50)
  star: "#fb9a00", // new — rating star (web fills it with brand)
  whatsapp: "#08b300", // new — WhatsApp button
  white: "#ffffff",
  scrim: "rgba(0,0,0,0.45)", // new — text and buttons over photos
  // Onboarding designs (2026-11-22): cream page, deeper wine buttons and accents, soft rose tiles.
  cream: "#faf6ef",
  wine: "#b0234f",
  roseSoft: "#f8e3ea",
  // Home redesign (2026-11-24): navy wordmark, plum "near you" banner.
  navy: "#1c1b4d",
  plum: "#6b1d55",
  plumDeep: "#3f0f36",
  tintPink: "#fce9f0", // web #fde8ef — chips, planning tiles, stats strip, phone chip
  tintLavender: "#f1ebfb",
  tintMint: "#e6f6ee",
  tintCream: "#fdf3e1",
  tintPeach: "#fdebe3",
  tintSky: "#e5f0fb",
  tintSand: "#f1efec",
  amberText: "#92400e", // web text-amber-800 — "waiting" status chips
  // Icons on the tints (web home categories: text-orange-800, rose-700, purple-700, emerald-800, sky-700, neutral-700)
  peachInk: "#9a3412",
  roseInk: "#be123c",
  lavenderInk: "#7e22ce",
  mintInk: "#065f46",
  skyInk: "#0369a1",
  sandInk: "#404040",

  // Vendor app (web values, not yet checked against designs)
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

export type ColorToken = keyof typeof colors;

/** Corner radii. Web values plus `full` for pills (buttons, chips) and circles. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

/** Spacing on a 4-point grid. `screen` is the side padding of every screen. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 20,
} as const;

/**
 * Font families, one per weight (Android ignores fontWeight on custom fonts). Same families as the web:
 * Inter for text, Plus Jakarta Sans for headings, prices and buttons. Loaded by `useAppFonts` (fonts.ts).
 */
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  displaySemibold: "PlusJakartaSans_600SemiBold",
  display: "PlusJakartaSans_700Bold",
  displayHeavy: "PlusJakartaSans_800ExtraBold",
  /** Serif headings of the onboarding designs (design/customer/onboarding*); closest Google font to the screenshots. */
  serif: "Fraunces_600SemiBold",
} as const;

/** Text styles, sized for a ~390 pt wide phone from the designs. */
export const type = {
  hero: { fontFamily: fonts.displayHeavy, fontSize: 30, lineHeight: 36 }, // home hero "Plan Your Dream Wedding"
  serifTitle: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 36 }, // onboarding "Shape your celebration"
  serifHeading: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32 }, // intro slide titles
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 }, // "Login with Phone Number", "Verify OTP"
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 }, // section titles, "Check Availability"
  subheading: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22 }, // card titles on detail pages, package names
  cardTitle: { fontFamily: fonts.display, fontSize: 16, lineHeight: 21 }, // listing card names
  lead: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 }, // subtitles under screen titles
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  meta: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 }, // location, review counts
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 }, // category labels, chips, links
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 }, // tab bar labels, badges
  price: { fontFamily: fonts.displayHeavy, fontSize: 17, lineHeight: 22 },
  button: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22 },
  buttonSmall: { fontFamily: fonts.display, fontSize: 14, lineHeight: 18 },
} as const;

export type TypeToken = keyof typeof type;

/** Shadows (React Native's boxShadow, same syntax as CSS). Web card: 0 2px 12px rgba(36,33,42,0.06). */
export const shadow = {
  card: "0 2px 12px rgba(20,20,20,0.08)",
  raised: "0 4px 16px rgba(20,20,20,0.12)", // floating action bar, buttons over photos
  none: "none",
} as const;

/** Fixed sizes from the designs. */
export const size = {
  control: 56, // buttons, inputs
  controlSmall: 40,
  iconButton: 44, // minimum touch target
  otpBox: 52,
  tabBar: 64,
} as const;
