import type { VendorType } from "@wedwizz/core/api/types";
import { formatEventDate } from "@wedwizz/core/chat/chat-view";

/** Plain TS, so the mobile app can reuse it. The prefilled, editable first message to a business. */

/** What the customer is interested in, per category. */
const INTEREST: Record<VendorType, string> = {
  VENUE: "booking your venue",
  PHOTOGRAPHY: "your photography services",
  MAKEUP: "your bridal makeup services",
  DECORATION: "your decoration services",
  DJ: "your DJ and music services",
  CATERING: "your catering services",
  WEDDING_PLANNING: "your wedding planning services",
};

/** Guest count matters to venues and caterers; the other categories do not ask for it. */
export function needsGuestCount(category: VendorType): boolean {
  return category === "VENUE" || category === "CATERING";
}

/** Today as "YYYY-MM-DD" in the device's time zone (India for our customers). */
export function todayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** The saved wedding date as the event date to suggest, unless it has passed. */
export function suggestedEventDate(weddingDate: string | null | undefined, today: string): string | null {
  return weddingDate && weddingDate >= today ? weddingDate : null;
}

export interface EnquiryTemplateInput {
  businessName: string;
  category: VendorType;
  /** "YYYY-MM-DD", or null when not fixed yet. */
  eventDate: string | null;
  guestCount: number | null;
  /** "availability" asks to confirm the date; "message" is a general first message. */
  kind: "availability" | "message";
}

/**
 * e.g. "Hi Lake View, I'm interested in booking your venue for my event on 29/10/2026 for 400 guests.
 * Could you confirm availability and share more details along with a quotation?"
 */
export function enquiryMessage({ businessName, category, eventDate, guestCount, kind }: EnquiryTemplateInput): string {
  const date = eventDate ? ` on ${formatEventDate(eventDate)}` : "";
  const guests = guestCount && needsGuestCount(category) ? ` for ${guestCount} guests` : "";
  const ask =
    kind === "availability" && eventDate
      ? "Could you confirm availability and share more details along with a quotation?"
      : "Could you share more details along with a quotation?";
  return `Hi ${businessName}, I'm interested in ${INTEREST[category]} for my event${date}${guests}. ${ask}`;
}
