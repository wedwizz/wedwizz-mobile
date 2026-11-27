import { describe, expect, it } from "vitest";
import { upcomingBookingCount, upcomingBookingsWarning } from "./delete-account-logic";

describe("upcomingBookingCount", () => {
  it("counts pending and confirmed bookings from today on, as the server cancels them", () => {
    const bookings = [
      { status: "CONFIRMED" as const, eventDate: "2027-03-02" }, // today
      { status: "PENDING" as const, eventDate: "2027-05-01" },
      { status: "CONFIRMED" as const, eventDate: "2027-03-01" }, // yesterday: kept
      { status: "CANCELLED" as const, eventDate: "2027-06-01" },
      { status: "DISPUTED" as const, eventDate: "2027-06-01" },
    ];
    expect(upcomingBookingCount(bookings, "2027-03-02")).toBe(2);
  });

  it("is 0 while the bookings are loading or there are none", () => {
    expect(upcomingBookingCount(undefined, "2027-03-02")).toBe(0);
    expect(upcomingBookingCount([], "2027-03-02")).toBe(0);
  });
});

describe("upcomingBookingsWarning", () => {
  it("says nothing without upcoming bookings, and counts them otherwise", () => {
    expect(upcomingBookingsWarning(0)).toBeNull();
    expect(upcomingBookingsWarning(1)).toBe("You have 1 upcoming booking. Deleting your account cancels it, and the vendor will see that you deleted your account.");
    expect(upcomingBookingsWarning(2)).toMatch(/^You have 2 upcoming bookings\. Deleting your account cancels them/);
  });
});
