/** Shared class strings for the customer app (literal strings so Tailwind generates them). */
export const CARD = "rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(36,33,42,0.06)]";
export const FIELD =
  "w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-3 text-[15px] text-ink placeholder:text-muted focus:border-brand focus:outline-none";
/** Enquiry status chips, by lead status. */
export const ENQUIRY_STATUS_CLASS = {
  NEW: "bg-tint-cream text-amber-800",
  REPLIED: "bg-tint-mint text-ok",
  QUOTED: "bg-tint-mint text-ok",
  BOOKED: "bg-tint-mint text-ok",
  LOST: "bg-tint-sand text-muted",
  DECLINED: "bg-tint-sand text-muted",
} as const;
/** Booking status chips, by tone (lib/bookings/booking-view.ts). */
export const BOOKING_TONE_CLASS = {
  action: "bg-tint-pink text-brand-dark",
  waiting: "bg-tint-cream text-amber-800",
  confirmed: "bg-tint-mint text-ok",
  done: "bg-tint-sand text-muted",
  closed: "bg-tint-sand text-muted",
} as const;
export const ICON_BTN =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warm text-ink transition-colors hover:bg-tint-pink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
