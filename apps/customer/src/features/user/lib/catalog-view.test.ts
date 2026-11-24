import { describe, expect, it } from "vitest";
import {
  DEFAULT_VENUE_FILTERS,
  countActiveVenueFilters,
  formatAnswer,
  moreByOwnerTitle,
  toCardView,
  toDetailView,
  toResultsView,
  vendorSearchQuery,
  venueSearchQuery,
} from "./catalog-view";
import { ALL_KERALA } from "./location";
import type { CatalogCard, CatalogDetail } from "@wedwizz/core/api/types";

function card(overrides: Partial<CatalogCard> = {}): CatalogCard {
  return {
    slug: "lake-view-kochi",
    name: "Lake View",
    category: "VENUE",
    kind: "LOCATION_BOUND",
    city: "Kochi",
    area: "Marine Drive, Kochi",
    startingPrice: 150000,
    capacity: 800,
    coverUrl: "https://cdn.example/cover.jpg",
    thumbnailUrl: "https://cdn.example/thumb.jpg",
    venueType: "Banquet hall",
    verified: true,
    rating: null,
    reviewCount: 0,
    distance: null,
    ...overrides,
  };
}

function detail(overrides: Partial<CatalogDetail> = {}): CatalogDetail {
  return {
    ...card(),
    description: "By the lake.",
    services: [],
    answers: [
      { section: "Venue", label: "Setting", value: "Indoor" },
      { section: "Venue", label: "Catering", value: true },
      { section: "Facilities", label: "Amenities", value: ["Parking", "AC"] },
      { section: "Pricing", label: "Vegetarian plate price (₹)", value: 650 },
    ],
    photos: [{ thumbnailUrl: "t1", displayUrl: "d1", width: null, height: null }],
    location: { addressLine: "1 Lake Rd", city: "Kochi", district: "Ernakulam", pincode: "682001", latitude: 9.9, longitude: 76.2 },
    serviceAreas: [],
    packages: [],
    brand: "Lake View Group",
    moreFromOwner: [card({ slug: "lake-view-annexe-kochi", name: "Lake View Annexe" })],
    contactChannels: [],
    ...overrides,
  };
}

describe("toCardView", () => {
  it("shows venue rent per day and a 'New' rating", () => {
    const view = toCardView(card());
    expect(view).toMatchObject({ isVenue: true, priceUnit: "per day", rating: null, to: "/user/venues/lake-view-kochi", categoryLabel: "Venue" });
  });

  it("carries the average rating and how many reviews it is from", () => {
    expect(toCardView(card({ rating: 4.5, reviewCount: 12 }))).toMatchObject({ rating: 4.5, reviewCount: 12 });
  });

  it("shows a service's price as onwards and falls back when places are missing", () => {
    const view = toCardView(card({ category: "PHOTOGRAPHY", kind: "SERVICE_BASED", city: null, area: null, startingPrice: null }));
    expect(view).toMatchObject({ isVenue: false, priceUnit: "onwards", city: "Kerala", area: "Kerala", startingPrice: null, to: "/user/vendors/lake-view-kochi" });
  });
});

describe("toDetailView", () => {
  it("groups answers by section and pulls out venue facts", () => {
    const view = toDetailView(detail());
    expect(view.sections.map((s) => s.title)).toEqual(["Venue", "Facilities", "Pricing"]);
    expect(view.sections[0].rows).toEqual([
      { label: "Setting", value: "Indoor" },
      { label: "Catering", value: "Yes" },
    ]);
    expect(view.facilities).toEqual(["Parking", "AC"]);
    expect(view.platePrice).toBe(650);
    expect(view.stats.map((s) => s.label)).toEqual(["Capacity", "Venue type", "Setting", "Catering"]);
    expect(view.photos).toEqual(["d1"]);
    expect(view.mapUrl).toBe("https://www.google.com/maps?q=9.9,76.2");
    expect(view.moreFromOwner.map((c) => c.slug)).toEqual(["lake-view-annexe-kochi"]);
  });

  it("has no venue stats or map for a service", () => {
    const view = toDetailView(detail({ category: "PHOTOGRAPHY", kind: "SERVICE_BASED", location: null, answers: [], moreFromOwner: [] }));
    expect(view.stats).toEqual([]);
    expect(view.mapUrl).toBeNull();
    expect(view.facilities).toEqual([]);
    expect(view.platePrice).toBeNull();
  });
});

describe("formatAnswer and titles", () => {
  it("formats each answer type", () => {
    expect(formatAnswer(["a", "b"])).toBe("a, b");
    expect(formatAnswer(false)).toBe("No");
    expect(formatAnswer(12)).toBe("12");
  });

  it("names the owner's brand, or not", () => {
    expect(moreByOwnerTitle("Lake View Group")).toBe("More venues by Lake View Group");
    expect(moreByOwnerTitle(null)).toBe("More venues by this owner");
  });
});

describe("search queries", () => {
  it("asks for every service when the category is 'all'", () => {
    expect(vendorSearchQuery({ category: "all", q: "  ", location: ALL_KERALA, price: "any", sort: "recommended" })).toEqual({ kind: "SERVICE_BASED", sort: "recommended" });
  });

  it("maps category, city, text and price range", () => {
    expect(vendorSearchQuery({ category: "photographers", q: " lumen ", location: "Kochi", price: "25k-75k", sort: "price-low" })).toEqual({
      category: "PHOTOGRAPHY",
      city: "Kochi",
      q: "lumen",
      minPrice: 25000,
      maxPrice: 75000,
      sort: "price-low",
    });
  });

  it("builds venue queries from the drawer filters", () => {
    expect(venueSearchQuery({ q: "", location: ALL_KERALA, filters: DEFAULT_VENUE_FILTERS, sort: "recommended" })).toEqual({ category: "VENUE", sort: "recommended" });
    const filters = { priceMax: 100000, minCapacity: 700 };
    expect(venueSearchQuery({ q: "", location: "Thrissur", filters, sort: "recommended" })).toEqual({
      category: "VENUE",
      city: "Thrissur",
      maxPrice: 100000,
      capacity: 700,
      sort: "recommended",
    });
    expect(countActiveVenueFilters(filters)).toBe(2);
    expect(countActiveVenueFilters(DEFAULT_VENUE_FILTERS)).toBe(0);
  });
});

describe("toResultsView", () => {
  const base = { isPending: false, isError: false, isFetchNextPageError: false };
  const loaded = { pages: [{ items: [card()] }, { items: [card({ slug: "hill-view-kochi" })] }] };
  const slugs = (view: ReturnType<typeof toResultsView>) => (view.state === "cards" ? view.cards.map((c) => c.slug) : view.state);

  it("shows loading, then the error page only when nothing has loaded", () => {
    expect(toResultsView({ ...base, isPending: true })).toEqual({ state: "loading" });
    expect(toResultsView({ ...base, isError: true })).toEqual({ state: "error" });
  });

  it("keeps the loaded cards when a later fetch fails", () => {
    // A failed background refetch: errored, data kept.
    expect(slugs(toResultsView({ ...base, isError: true, data: loaded }))).toEqual(["lake-view-kochi", "hill-view-kochi"]);
    expect(toResultsView({ ...base, isError: true, data: loaded })).toMatchObject({ loadMoreFailed: false });
    // A failed "Load more": the cards stay, with a note by the button.
    expect(toResultsView({ ...base, isError: true, isFetchNextPageError: true, data: loaded })).toMatchObject({
      state: "cards",
      loadMoreFailed: true,
    });
  });

  it("is empty when the search found nothing", () => {
    expect(toResultsView({ ...base, data: { pages: [{ items: [] }] } })).toEqual({ state: "empty" });
  });
});

describe("venueSearchQuery near the customer", () => {
  const near = { point: { latitude: 9.93123, longitude: 76.26789 }, radiusKm: 25 as const };

  it("asks for nearby venues first, then the rest, when the sort is Recommended", () => {
    expect(venueSearchQuery({ q: "", location: ALL_KERALA, filters: DEFAULT_VENUE_FILTERS, sort: "recommended", near })).toEqual({
      category: "VENUE",
      lat: 9.931,
      lng: 76.268,
      radiusKm: 25,
      sort: "nearby-first",
    });
  });

  it("keeps a price sort, without the point", () => {
    expect(venueSearchQuery({ q: "", location: ALL_KERALA, filters: DEFAULT_VENUE_FILTERS, sort: "price-low", near })).toEqual({
      category: "VENUE",
      sort: "price-low",
    });
  });

  it("is unchanged without Near me", () => {
    expect(venueSearchQuery({ q: "", location: ALL_KERALA, filters: DEFAULT_VENUE_FILTERS, sort: "recommended", near: null })).toEqual({
      category: "VENUE",
      sort: "recommended",
    });
  });
});

describe("vendorSearchQuery near the customer", () => {
  const near = { point: { latitude: 9.93123, longitude: 76.26789 }, radiusKm: 10 as const };

  it("asks for vendors within the radius first, then the rest, when the sort is Recommended", () => {
    expect(vendorSearchQuery({ category: "all", q: "", location: ALL_KERALA, price: "any", sort: "recommended", near })).toEqual({
      kind: "SERVICE_BASED",
      lat: 9.931,
      lng: 76.268,
      radiusKm: 10,
      sort: "nearby-first",
    });
  });

  it("keeps a price sort within the radius", () => {
    expect(vendorSearchQuery({ category: "all", q: "", location: ALL_KERALA, price: "any", sort: "price-low", near })).toMatchObject({
      radiusKm: 10,
      sort: "price-low",
    });
  });
});
