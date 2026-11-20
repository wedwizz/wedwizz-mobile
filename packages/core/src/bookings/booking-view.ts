import type { BookingStatus, EnquiryBooking, MessageSender } from "../api/types";
import { formatINR } from "../format";

/** Plain TS shared by the customer and vendor booking screens (and later the mobile app). */

type Side = "customer" | "vendor";
const SENDER: Record<Side, MessageSender> = { customer: "CUSTOMER", vendor: "VENDOR" };

/** The booking fields the labels need. */
type BookingLike = Pick<EnquiryBooking, "status" | "proposedBy" | "eventDate"> & {
  closedBy?: MessageSender | null;
  closedReason?: string | null;
};

/** Colours a status pill: something to do, waiting on the other side, settled, or over. */
export type BookingTone = "action" | "waiting" | "confirmed" | "done" | "closed";

/** The day after the event onwards, given today's "YYYY-MM-DD". */
export function eventPassed(eventDate: string, today: string): boolean {
  return eventDate < today;
}

/** A short status for a pill: "Waiting for you", "Confirmed", "Completed", "Not booked", "Cancelled". */
export function bookingStatusLabel(booking: BookingLike, side: Side, today: string): string {
  switch (booking.status) {
    case "PENDING":
      return booking.proposedBy === SENDER[side] ? (side === "customer" ? "Waiting for the business" : "Waiting for the customer") : "Waiting for you";
    case "CONFIRMED":
      return eventPassed(booking.eventDate, today) ? "Completed" : "Confirmed";
    case "DISPUTED":
      return "Not booked";
    case "CANCELLED":
      return "Cancelled";
  }
}

export function bookingTone(booking: BookingLike, side: Side, today: string): BookingTone {
  switch (booking.status) {
    case "PENDING":
      return booking.proposedBy === SENDER[side] ? "waiting" : "action";
    case "CONFIRMED":
      return eventPassed(booking.eventDate, today) ? "done" : "confirmed";
    default:
      return "closed";
  }
}

/**
 * One sentence on where the booking stands, naming the other side: e.g. "Lake View marked this as booked.
 * Confirm it if you booked them." Includes the reason given for a dispute or cancellation.
 */
export function bookingNote(booking: BookingLike, side: Side, otherName: string): string {
  const mine = (sender: MessageSender | null | undefined) => sender === SENDER[side];
  const reason = booking.closedReason ? `: "${booking.closedReason}"` : ".";
  switch (booking.status) {
    case "PENDING":
      if (mine(booking.proposedBy)) return `Waiting for ${otherName} to confirm.`;
      return side === "customer"
        ? `${otherName} marked this as booked. Confirm it if you booked them.`
        : `${otherName} says they booked you. Confirm it if they did.`;
    case "CONFIRMED":
      return "Confirmed by you both.";
    case "DISPUTED":
      return mine(booking.closedBy) ? `You said this wasn't booked${reason}` : `${otherName} said this wasn't booked${reason}`;
    case "CANCELLED":
      return mine(booking.closedBy) ? `You cancelled this booking${reason}` : `${otherName} cancelled this booking${reason}`;
  }
}

/** "₹1,50,000", or "Amount not given". */
export function bookingAmountLabel(amount: number | null): string {
  return amount === null ? "Amount not given" : formatINR(amount);
}

/** "November 2026" for a "YYYY-MM" event month. */
export function eventMonthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

/** Waiting or confirmed: what a calendar shows. */
export function isBookingLive(status: BookingStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

/** Live bookings keyed by event date ("YYYY-MM-DD"), for a calendar. */
export function bookingsByDate<T extends Pick<EnquiryBooking, "status" | "eventDate">>(bookings: readonly T[]): Record<string, T[]> {
  const byDate: Record<string, T[]> = {};
  for (const booking of bookings) {
    if (!isBookingLive(booking.status)) continue;
    (byDate[booking.eventDate] ??= []).push(booking);
  }
  return byDate;
}

/** What a thread or lead sheet says about its booking, or null when there is none worth showing. */
export function threadBookingNote(booking: EnquiryBooking | null, side: Side, otherName: string): string | null {
  if (!booking || booking.status === "CANCELLED") return null;
  return bookingNote(booking, side, otherName);
}
