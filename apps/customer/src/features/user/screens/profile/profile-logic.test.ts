import { describe, expect, it } from "vitest";
import type { CatalogCard, CustomerProfile, Favourite } from "@wedwizz/core/api/types";
import { countLabel, profileDetails, savedCount, weddingDateLabel } from "./profile-logic";

const profile: CustomerProfile = {
  name: "Anjali Menon",
  weddingRole: "BRIDE",
  email: null,
  city: "Kochi",
  weddingDate: null,
  partnerName: null,
  guestRange: "FROM_300_TO_500",
  budgetRange: null,
  updatedAt: "2026-11-01T00:00:00.000Z",
};

describe("profileDetails", () => {
  it("lists the details in the web's order with its stand-ins", () => {
    expect(profileDetails(profile, "9876543210")).toEqual([
      { label: "I am the", value: "Bride" },
      { label: "Phone", value: "+91 9876543210" },
      { label: "Email", value: "Not added" },
      { label: "City", value: "Kochi" },
      { label: "Wedding date", value: "Not set" },
      { label: "Partner", value: "Not added" },
      { label: "Guests", value: "300 – 500" },
      { label: "Budget", value: "Not set" },
    ]);
  });

  it("shows a dash without the phone number", () => {
    expect(profileDetails(profile, null)[1].value).toBe("—");
  });

  it("writes the wedding date out", () => {
    expect(weddingDateLabel("2027-02-14")).toMatch(/14.*2027/);
  });
});

describe("counts", () => {
  it("counts only saved listings that are still listed", () => {
    const fav = (slug: string, listed: boolean): Favourite => ({ slug, savedAt: "", listing: listed ? ({ slug } as CatalogCard) : null });
    expect(savedCount([fav("a", true), fav("b", false), fav("c", true)])).toBe(2);
    expect(savedCount(undefined)).toBe(0);
  });

  it("shows a dash until a count is known", () => {
    expect(countLabel(undefined)).toBe("–");
    expect(countLabel(0)).toBe("0");
  });
});
