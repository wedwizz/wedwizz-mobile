/**
 * Decisions from the web's enquiries-page.tsx, enquiry-thread-page.tsx, thread-booking-banner.tsx and
 * booking-sheets.tsx, kept out of the screens so they can be tested without rendering.
 */
import type { PillTone } from "@wedwizz/ui";
import type { ChatMessage, CustomerEnquiry, LeadStatus } from "@wedwizz/core/api/types";
import { isBookingLive } from "@wedwizz/core/bookings/booking-view";
import { contactNoteLabel, eventDateLabel, groupByDay, messagePreview, messageTime } from "@wedwizz/core/chat/chat-view";
import { budgetRangeLabel } from "@/features/user/lib/customer-profile";

/** Status chip colours (web ENQUIRY_STATUS_CLASS). */
export const STATUS_TONE: Record<LeadStatus, PillTone> = {
  NEW: "waiting",
  REPLIED: "ok",
  QUOTED: "ok",
  BOOKED: "ok",
  LOST: "neutral",
  DECLINED: "neutral",
};

/** The business's page, or null when it has none any more (threads and bookings). */
export function businessPath(enquiry: { business: Pick<CustomerEnquiry["business"], "slug" | "category"> }): string | null {
  const { slug, category } = enquiry.business;
  return slug ? `/user/${category === "VENUE" ? "venues" : "vendors"}/${slug}` : null;
}

/** "12 Dec 2026 · 400 guests · ₹5–10 lakh" under the business's name. */
export function threadDetails(enquiry: Pick<CustomerEnquiry, "eventDate" | "guestCount" | "budgetRange">): string {
  return [
    eventDateLabel(enquiry.eventDate),
    enquiry.guestCount ? `${enquiry.guestCount} guests` : null,
    enquiry.budgetRange ? budgetRangeLabel(enquiry.budgetRange) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Why the customer can't write, or null when they can (web Composer). */
export function composerClosedNote(enquiry: Pick<CustomerEnquiry, "open" | "business">): string | null {
  if (!enquiry.open) return "This conversation is closed. Message the business from its page to start a new one.";
  if (!enquiry.business.live) return "This business is not taking messages right now.";
  return null;
}

/** The inbox row's last line: "You: …" for the customer's own text. */
export function inboxPreview(lastMessage: ChatMessage | null): string {
  if (!lastMessage) return "";
  const mine = lastMessage.sender === "CUSTOMER" && lastMessage.kind === "TEXT";
  return `${mine ? "You: " : ""}${messagePreview(lastMessage, "customer")}`;
}

/** Whether "I booked them" shows (web ThreadBookingBanner). */
export function canProposeBooking(enquiry: Pick<CustomerEnquiry, "open" | "business" | "booking">): boolean {
  return enquiry.open && enquiry.business.live && !(enquiry.booking && isBookingLive(enquiry.booking.status));
}

/** The "I booked them" sheet's checks (web ProposeBookingSheet); null when it can be sent. */
export function proposeBookingError(date: string, amount: string, today: string): string | null {
  if (!date) return "Choose the event date.";
  if (date < today) return "The event date cannot be in the past.";
  const value = amount.trim() ? Number(amount) : null;
  if (value !== null && (!Number.isInteger(value) || value < 0)) return "Enter the amount in whole rupees, e.g. 150000.";
  return null;
}

export type ThreadRow =
  | { type: "day"; key: string; label: string }
  | { type: "note"; key: string; text: string }
  | { type: "message"; key: string; mine: boolean; text: string; time: string; read: boolean };

/**
 * The thread as rows, oldest first: a day label, then that day's messages. A WhatsApp or Call tap is a note in the
 * thread, not a bubble (web groupByDay rendering).
 */
export function threadRows(messages: ChatMessage[], now: Date = new Date()): ThreadRow[] {
  const rows: ThreadRow[] = [];
  for (const day of groupByDay(messages, now)) {
    rows.push({ type: "day", key: `day-${day.label}`, label: day.label });
    for (const m of day.messages) {
      const note = contactNoteLabel(m, "customer");
      if (note) rows.push({ type: "note", key: m.messageId, text: `${note} · ${messageTime(m.sentAt)}` });
      else {
        const mine = m.sender === "CUSTOMER";
        rows.push({ type: "message", key: m.messageId, mine, text: m.text, time: messageTime(m.sentAt), read: mine && !!m.readAt });
      }
    }
  }
  return rows;
}
