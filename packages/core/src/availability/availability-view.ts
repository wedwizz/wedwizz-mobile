import type { Availability } from "../api/types";
import { formatEventDate } from "../chat/chat-view";

/** Plain TS: what the "Check availability" card says about a result (later reused by the mobile app). */

export type AvailabilityTone = "ok" | "warn" | "unknown";

export interface AvailabilityMessage {
  tone: AvailabilityTone;
  title: string;
  body: string;
}

/** The status in words. A blocked date never says why: the business only marked it as unavailable. */
export function availabilityMessage(result: Pick<Availability, "date" | "status">, businessName: string): AvailabilityMessage {
  const day = formatEventDate(result.date);
  switch (result.status) {
    case "AVAILABLE":
      return { tone: "ok", title: `Looks free on ${day}`, body: `Ask ${businessName} to confirm and share a quote.` };
    case "BLOCKED":
      return { tone: "warn", title: `Not available on ${day}`, body: `${businessName} isn't taking bookings that day. You can still ask, or try another date.` };
    case "UNKNOWN":
      return { tone: "unknown", title: "Availability not confirmed", body: `${businessName} hasn't updated its calendar recently. Ask them about ${day}.` };
  }
}

/** A venue's capacity: a warning when the guests don't fit, otherwise how many it holds. Null for other businesses. */
export function capacityMessage(capacity: Availability["capacity"]): { warn: boolean; text: string } | null {
  if (!capacity) return null;
  const text = `This venue fits up to ${capacity.maxGuests.toLocaleString("en-IN")} guests`;
  return { warn: capacity.fits === false, text };
}
