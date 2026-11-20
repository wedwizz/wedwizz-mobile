import { describe, expect, it } from "vitest";
import { nearMeFallback } from "@/features/user/lib/near-me";
import { nearQuery, toCardView, vendorSearchQuery } from "@/features/user/lib/catalog-view";
import { ALL_KERALA } from "@/features/user/lib/location";
import type { CatalogCard } from "@wedwizz/core/api/types";

describe("near me fallback", () => {
  it("falls back to the city picker with a note on how to turn location on, never blocking", () => {
    const denied = nearMeFallback("denied");
    expect(denied.showCityPicker).toBe(true);
    expect(denied.note).toMatch(/Location → Allow/);
    expect(nearMeFallback("unavailable")).toMatchObject({ showCityPicker: true });
    expect(nearMeFallback("timeout")).toMatchObject({ showCityPicker: true, note: expect.stringMatching(/Try again/) });
  });

  it("shows nothing extra before asking or while asking", () => {
    expect(nearMeFallback("idle")).toEqual({ showCityPicker: false, note: null });
    expect(nearMeFallback("asking")).toEqual({ showCityPicker: false, note: null });
  });
});

describe("nearby search request", () => {
  const point = { latitude: 9.931234, longitude: 76.267891 };

  it("sends the point rounded to 3 decimals, with the radius", () => {
    expect(nearQuery({ point, radiusKm: 10 })).toEqual({ lat: 9.931, lng: 76.268, radiusKm: 10 });
    expect(nearQuery(null)).toEqual({});
  });

  it("sorts nearest first near the customer, keeps a chosen price sort, and filters by a chosen city", () => {
    const base = { category: "all", q: "", location: ALL_KERALA, price: "any" as const };
    expect(vendorSearchQuery({ ...base, sort: "recommended", near: { point, radiusKm: 25 } })).toMatchObject({ sort: "distance", lat: 9.931, radiusKm: 25 });
    expect(vendorSearchQuery({ ...base, sort: "price-low", near: { point, radiusKm: 25 } })).toMatchObject({ sort: "price-low" });
    expect(vendorSearchQuery({ ...base, location: "Kochi", sort: "recommended", near: { point, radiusKm: 25 } })).toMatchObject({
      city: "Kochi",
      sort: "distance",
    });
    expect(vendorSearchQuery({ ...base, sort: "recommended" })).not.toHaveProperty("lat");
  });

  it("labels cards with their distance when searching nearby", () => {
    const card = { slug: "s", name: "n", category: "DJ", kind: "SERVICE_BASED", city: "Kochi", area: null, startingPrice: null, capacity: null, coverUrl: null, thumbnailUrl: null, venueType: null, verified: true, rating: null, reviewCount: 0 } as const;
    expect(toCardView({ ...card, distance: { km: 2, approximate: true } } as CatalogCard).distanceLabel).toBe("about 2 km away");
    expect(toCardView({ ...card, distance: null } as CatalogCard).distanceLabel).toBeNull();
  });
});
