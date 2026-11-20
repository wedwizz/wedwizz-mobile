import { describe, expect, it } from "vitest";
import { availabilityMessage, capacityMessage } from "./availability-view";

describe("availability view", () => {
  it("puts each status in words, never saying why a date is blocked", () => {
    expect(availabilityMessage({ date: "2026-12-12", status: "AVAILABLE" }, "Lake View")).toEqual({
      tone: "ok",
      title: "Looks free on 12/12/2026",
      body: "Ask Lake View to confirm and share a quote.",
    });
    const blocked = availabilityMessage({ date: "2026-12-12", status: "BLOCKED" }, "Lake View");
    expect(blocked).toMatchObject({ tone: "warn", title: "Not available on 12/12/2026" });
    expect(blocked.body).toContain("You can still ask");
    expect(availabilityMessage({ date: "2026-12-12", status: "UNKNOWN" }, "Lake View")).toMatchObject({
      tone: "unknown",
      title: "Availability not confirmed",
    });
  });

  it("warns only when the guests don't fit the venue", () => {
    expect(capacityMessage({ maxGuests: 350, fits: false })).toEqual({ warn: true, text: "This venue fits up to 350 guests" });
    expect(capacityMessage({ maxGuests: 1200, fits: true })).toEqual({ warn: false, text: "This venue fits up to 1,200 guests" });
    expect(capacityMessage({ maxGuests: 350, fits: null })).toEqual({ warn: false, text: "This venue fits up to 350 guests" });
    expect(capacityMessage(null)).toBeNull();
  });
});
