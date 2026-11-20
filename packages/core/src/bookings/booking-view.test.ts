import { describe, expect, it } from "vitest";
import {
  bookingAmountLabel,
  bookingNote,
  bookingsByDate,
  bookingStatusLabel,
  bookingTone,
  eventMonthLabel,
  threadBookingNote,
} from "./booking-view";
import type { EnquiryBooking } from "../api/types";

const TODAY = "2026-10-29";
const booking = (overrides: Partial<EnquiryBooking & { closedBy: "CUSTOMER" | "VENDOR" | null; closedReason: string | null }> = {}) => ({
  bookingId: "b1",
  status: "PENDING" as const,
  proposedBy: "VENDOR" as const,
  eventDate: "2026-11-20",
  amount: null,
  closedBy: null,
  closedReason: null,
  ...overrides,
});

describe("booking labels", () => {
  it("tells each side whether the booking waits for them or for the other side", () => {
    expect(bookingStatusLabel(booking(), "customer", TODAY)).toBe("Waiting for you");
    expect(bookingTone(booking(), "customer", TODAY)).toBe("action");
    expect(bookingStatusLabel(booking(), "vendor", TODAY)).toBe("Waiting for the customer");
    expect(bookingTone(booking(), "vendor", TODAY)).toBe("waiting");
    expect(bookingStatusLabel(booking({ proposedBy: "CUSTOMER" }), "customer", TODAY)).toBe("Waiting for the business");
  });

  it("calls a confirmed booking completed from the day after its event", () => {
    expect(bookingStatusLabel(booking({ status: "CONFIRMED" }), "customer", TODAY)).toBe("Confirmed");
    expect(bookingStatusLabel(booking({ status: "CONFIRMED", eventDate: TODAY }), "customer", TODAY)).toBe("Confirmed");
    expect(bookingStatusLabel(booking({ status: "CONFIRMED", eventDate: "2026-10-28" }), "vendor", TODAY)).toBe("Completed");
    expect(bookingTone(booking({ status: "CONFIRMED", eventDate: "2026-10-28" }), "vendor", TODAY)).toBe("done");
    expect(bookingStatusLabel(booking({ status: "DISPUTED" }), "vendor", TODAY)).toBe("Not booked");
    expect(bookingTone(booking({ status: "CANCELLED" }), "vendor", TODAY)).toBe("closed");
  });

  it("explains the booking from each side, with the reason given", () => {
    expect(bookingNote(booking(), "customer", "Lake View")).toBe("Lake View marked this as booked. Confirm it if you booked them.");
    expect(bookingNote(booking(), "vendor", "Anjali")).toBe("Waiting for Anjali to confirm.");
    expect(bookingNote(booking({ proposedBy: "CUSTOMER" }), "vendor", "Anjali")).toBe("Anjali says they booked you. Confirm it if they did.");
    expect(bookingNote(booking({ status: "DISPUTED", closedBy: "CUSTOMER", closedReason: "Booked elsewhere" }), "vendor", "Anjali")).toBe(
      'Anjali said this wasn\'t booked: "Booked elsewhere"',
    );
    expect(bookingNote(booking({ status: "CANCELLED", closedBy: "CUSTOMER" }), "customer", "Lake View")).toBe("You cancelled this booking.");
    expect(threadBookingNote(null, "customer", "Lake View")).toBeNull();
    expect(threadBookingNote(booking({ status: "CANCELLED" }), "customer", "Lake View")).toBeNull();
    expect(threadBookingNote(booking({ status: "CONFIRMED" }), "customer", "Lake View")).toBe("Confirmed by you both.");
  });

  it("formats amounts and event months", () => {
    expect(bookingAmountLabel(null)).toBe("Amount not given");
    expect(bookingAmountLabel(150000)).toBe("₹1,50,000");
    expect(eventMonthLabel("2026-11")).toBe("November 2026");
  });

  it("puts only waiting and confirmed bookings on the calendar", () => {
    const byDate = bookingsByDate([
      booking({ bookingId: "a" }),
      booking({ bookingId: "b", status: "CONFIRMED" }),
      booking({ bookingId: "c", status: "DISPUTED" }),
      booking({ bookingId: "d", status: "CANCELLED", eventDate: "2026-11-21" }),
    ]);
    expect(Object.keys(byDate)).toEqual(["2026-11-20"]);
    expect(byDate["2026-11-20"].map((b) => b.bookingId)).toEqual(["a", "b"]);
  });
});
