/** Decisions from the web's bookings-page.tsx and booking-sheets.tsx, kept out of the screens so they can be tested. */
import type { PillTone } from "@wedwizz/ui";
import type { BookingStatus } from "@wedwizz/core/api/types";
import type { BookingTone } from "@wedwizz/core/bookings/booking-view";

/** Status chip colours (web BOOKING_TONE_CLASS). */
export const BOOKING_PILL_TONE: Record<BookingTone, PillTone> = {
  action: "action",
  waiting: "waiting",
  confirmed: "ok",
  done: "neutral",
  closed: "neutral",
};

/** The cancel button: a confirmed booking is cancelled, a request not yet confirmed is withdrawn. */
export const cancelLabel = (status: BookingStatus): string => (status === "CONFIRMED" ? "Cancel booking" : "Withdraw");

/** What the "Cancel this booking?" sheet says. */
export function cancelSheetBody(status: BookingStatus, businessName: string): string {
  return status === "CONFIRMED"
    ? `${businessName} will see that you cancelled. This cannot be undone.`
    : "Your request to confirm this booking will be withdrawn.";
}

export const REVIEW_MIN = 10;
export const REVIEW_MAX = 2000;

/** "Write a review": a rating and at least 10 characters (web ReviewSheet). */
export function reviewError(rating: number, text: string): string {
  if (rating < 1) return "Choose a rating from 1 to 5 stars.";
  if (text.trim().length < REVIEW_MIN) return `Write at least ${REVIEW_MIN} characters.`;
  return "";
}
