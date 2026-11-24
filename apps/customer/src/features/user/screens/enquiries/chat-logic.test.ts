import { describe, expect, it } from "vitest";
import type { ChatMessage, CustomerEnquiry } from "@wedwizz/core/api/types";
import { MARKET_ITEMS } from "@/features/user/data/market";
import { shortlist } from "@/features/user/screens/favourites/shortlist";
import { businessPath, canProposeBooking, composerClosedNote, inboxPreview, proposeBookingError, threadDetails, threadRows } from "./chat-logic";

const business = { slug: "lumen", name: "Lumen", category: "PHOTOGRAPHY", thumbnailUrl: null, live: true } as CustomerEnquiry["business"];
const msg = (id: string, sentAt: string, over: Partial<ChatMessage> = {}): ChatMessage => ({
  messageId: id,
  sender: "CUSTOMER",
  kind: "TEXT",
  text: `text ${id}`,
  sentAt,
  readAt: null,
  ...over,
});

describe("thread header", () => {
  it("links to the business's page when it still has one", () => {
    expect(businessPath({ business })).toBe("/user/vendors/lumen");
    expect(businessPath({ business: { ...business, category: "VENUE", slug: "hall" } })).toBe("/user/venues/hall");
    expect(businessPath({ business: { ...business, slug: null } })).toBeNull();
  });

  it("lists only the details the customer gave", () => {
    expect(threadDetails({ eventDate: null, guestCount: 400, budgetRange: null })).toContain("400 guests");
    expect(threadDetails({ eventDate: null, guestCount: null, budgetRange: null })).not.toContain("guests");
  });
});

describe("composer", () => {
  it("is closed for a closed thread or a business that stopped taking messages", () => {
    expect(composerClosedNote({ open: false, business })).toMatch(/closed/);
    expect(composerClosedNote({ open: true, business: { ...business, live: false } })).toBe("This business is not taking messages right now.");
    expect(composerClosedNote({ open: true, business })).toBeNull();
  });
});

describe("inbox preview", () => {
  it("marks the customer's own text", () => {
    expect(inboxPreview(msg("1", "2026-11-20T10:00:00Z"))).toBe("You: text 1");
    expect(inboxPreview(msg("2", "2026-11-20T10:00:00Z", { sender: "VENDOR" }))).toBe("text 2");
    expect(inboxPreview(null)).toBe("");
  });
});

describe("I booked them", () => {
  it("shows while the thread is open and no booking is waiting or confirmed", () => {
    expect(canProposeBooking({ open: true, business, booking: null })).toBe(true);
    expect(canProposeBooking({ open: true, business, booking: { status: "PENDING" } as never })).toBe(false);
    expect(canProposeBooking({ open: true, business, booking: { status: "CANCELLED" } as never })).toBe(true);
    expect(canProposeBooking({ open: false, business, booking: null })).toBe(false);
  });

  it("needs a date from today and a whole amount if given", () => {
    const today = "2026-11-22";
    expect(proposeBookingError("", "", today)).toBe("Choose the event date.");
    expect(proposeBookingError("2026-11-01", "", today)).toBe("The event date cannot be in the past.");
    expect(proposeBookingError(today, "12.5", today)).toBe("Enter the amount in whole rupees, e.g. 150000.");
    expect(proposeBookingError(today, "150000", today)).toBeNull();
    expect(proposeBookingError(today, "", today)).toBeNull();
  });
});

describe("thread rows", () => {
  it("puts a day label before each day and shows contact taps as notes", () => {
    const now = new Date("2026-11-22T12:00:00Z");
    const rows = threadRows(
      [
        msg("1", "2026-11-21T09:00:00Z", { readAt: "2026-11-21T10:00:00Z" }),
        msg("2", "2026-11-22T09:00:00Z", { kind: "WHATSAPP" }),
        msg("3", "2026-11-22T09:05:00Z", { sender: "VENDOR" }),
      ],
      now,
    );
    expect(rows.map((r) => r.type)).toEqual(["day", "message", "day", "note", "message"]);
    expect(rows[1]).toMatchObject({ mine: true, read: true });
    expect(rows[4]).toMatchObject({ mine: false, read: false });
  });
});

describe("shortlist", () => {
  it("splits saved listings into venues, vendors and gone, and picks the saved market items", () => {
    const listing = (slug: string, category: string) => ({ slug, category, name: slug, city: null, area: null, startingPrice: null, capacity: null, coverUrl: null, venueType: null, verified: false, rating: null, reviewCount: 0, distance: null });
    const lists = shortlist(
      [
        { slug: "hall", savedAt: "", listing: listing("hall", "VENUE") },
        { slug: "lumen", savedAt: "", listing: listing("lumen", "PHOTOGRAPHY") },
        { slug: "old", savedAt: "", listing: null },
      ] as never,
      [MARKET_ITEMS[0]!.id],
    );
    expect(lists.venues.map((c) => c.slug)).toEqual(["hall"]);
    expect(lists.vendors.map((c) => c.slug)).toEqual(["lumen"]);
    expect(lists.gone).toEqual(["old"]);
    expect(lists.market.map((m) => m.id)).toEqual([MARKET_ITEMS[0]!.id]);
  });
});
