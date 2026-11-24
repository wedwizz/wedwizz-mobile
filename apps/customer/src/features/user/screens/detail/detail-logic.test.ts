import { describe, expect, it } from "vitest";
import type { CatalogCard } from "@wedwizz/core/api/types";
import { availabilityStep, composeError, contactNote, heroPhotos, otherListings } from "./detail-logic";

const today = "2026-11-22";

describe("check availability", () => {
  const base = { date: "2026-12-10", notFixed: false, guests: "", askGuests: true, today };

  it("asks for a date unless it isn't fixed, and refuses past dates", () => {
    expect(availabilityStep({ ...base, date: "" })).toEqual({ kind: "error", message: "Choose a date, or tick “Date not fixed yet”." });
    expect(availabilityStep({ ...base, date: "2026-11-21" })).toEqual({ kind: "error", message: "Choose a date from today on." });
    expect(availabilityStep({ ...base, date: today })).toMatchObject({ kind: "check" });
  });

  it("checks the guests where they are asked for", () => {
    expect(availabilityStep({ ...base, guests: "0" })).toMatchObject({ kind: "error", message: "Enter the number of guests, e.g. 400." });
    expect(availabilityStep({ ...base, guests: "4.5" })).toMatchObject({ kind: "error" });
    expect(availabilityStep({ ...base, guests: "400" })).toEqual({ kind: "check", checked: { date: "2026-12-10", guests: 400 } });
    // Not asked (e.g. photographers): typed guests are ignored.
    expect(availabilityStep({ ...base, askGuests: false, guests: "abc" })).toEqual({ kind: "check", checked: { date: "2026-12-10" } });
  });

  it("goes straight to the message when the date isn't fixed", () => {
    expect(availabilityStep({ ...base, date: "", notFixed: true, guests: "250" })).toEqual({ kind: "ask", guestCount: 250 });
  });
});

describe("compose a message", () => {
  it("refuses a past date, bad guests and an empty message", () => {
    expect(composeError({ eventDate: "2026-01-01", guestCount: null, message: "Hi", today })).toBe("The event date cannot be in the past.");
    expect(composeError({ eventDate: null, guestCount: 200_000, message: "Hi", today })).toBe("Enter the number of guests, e.g. 400.");
    expect(composeError({ eventDate: null, guestCount: null, message: "  ", today })).toBe("Write a message.");
    expect(composeError({ eventDate: today, guestCount: 300, message: "Hi", today })).toBeNull();
  });
});

describe("contact note", () => {
  it("shows the error first, then the resume hint, then the privacy note", () => {
    expect(contactNote({ error: "Failed", resume: "CALL", channels: ["CALL"] })).toEqual({ text: "Failed", tone: "error" });
    expect(contactNote({ error: "", resume: "WHATSAPP", channels: ["WHATSAPP"] })).toEqual({ text: "Tap WhatsApp to continue.", tone: "resume" });
    expect(contactNote({ error: "", resume: null, channels: ["CALL"] })).toEqual({ text: "WhatsApp and Call share your number with this business.", tone: "muted" });
    expect(contactNote({ error: "", resume: null, channels: [] })).toBeNull();
  });
});

describe("other listings", () => {
  const card = (slug: string) => ({ slug }) as CatalogCard;

  it("leaves out this listing and the owner's, at most 4", () => {
    const items = ["a", "self", "b", "c", "owned", "d", "e"].map(card);
    expect(otherListings(items, "self", [{ slug: "owned" } as never]).map((c) => c.slug)).toEqual(["a", "b", "c", "d"]);
    expect(otherListings(undefined, "self")).toEqual([]);
  });
});

describe("hero photos", () => {
  it("puts the cover first and shows each photo once", () => {
    expect(heroPhotos("c.jpg", ["a.jpg", "c.jpg", "b.jpg"])).toEqual(["c.jpg", "a.jpg", "b.jpg"]);
    expect(heroPhotos(null, [])).toEqual([]);
  });
});
