import { describe, expect, it } from "vitest";
import { POPULAR_SERVICES, SEARCH_CATEGORIES, cheapestQuery, featuredVenuesQuery, hasUnread, homeSearchPath, plannerCounts, popularVendorsQuery, servicePrice } from "./home-logic";

describe("home search", () => {
  it("sends venues to the Venues tab with the words", () => {
    expect(homeSearchPath("venues", "  beach resort ")).toBe("/user/venues?q=beach%20resort");
    expect(homeSearchPath("venues", "")).toBe("/user/venues");
  });

  it("sends a vendor category to the Vendors tab with the category and the words", () => {
    expect(homeSearchPath("photographers", "candid")).toBe("/user/vendors?category=photographers&q=candid");
    expect(homeSearchPath("makeup", " ")).toBe("/user/vendors?category=makeup");
  });

  it("sends all services to the Vendors tab without a category", () => {
    expect(homeSearchPath("all", "Kochi & co")).toBe("/user/vendors?q=Kochi%20%26%20co");
    expect(homeSearchPath("all", "")).toBe("/user/vendors");
  });

  it("offers all services, venues, then the web's vendor categories", () => {
    expect(SEARCH_CATEGORIES.slice(0, 2).map((c) => c.value)).toEqual(["all", "venues"]);
    expect(SEARCH_CATEGORIES.map((c) => c.value)).toContain("photographers");
  });
});

describe("planner counts", () => {
  it("counts tasks, done tasks and saved listings that are still public", () => {
    const checklist = { tasks: [{ done: true }, { done: false }, { done: true }] } as never;
    const favourites = [{ listing: {} }, { listing: null }, { listing: {} }] as never;
    expect(plannerCounts(checklist, favourites)).toEqual({ tasks: 3, done: 2, saved: 2 });
  });

  it("shows zeros for a guest or while loading", () => {
    expect(plannerCounts(undefined, undefined)).toEqual({ tasks: 0, done: 0, saved: 0 });
  });
});

describe("chat dot", () => {
  it("shows only when a conversation has unread messages", () => {
    expect(hasUnread(undefined)).toBe(false);
    expect(hasUnread([{ unreadCount: 0 }])).toBe(false);
    expect(hasUnread([{ unreadCount: 0 }, { unreadCount: 2 }])).toBe(true);
  });
});


describe("popular services", () => {
  it("lists venues first, then vendor categories, each going to its own page", () => {
    expect(POPULAR_SERVICES[0]).toEqual({ key: "venues", label: "Wedding Venues", category: "VENUE", to: "/user/venues" });
    expect(POPULAR_SERVICES.map((s) => s.label)).toEqual([
      "Wedding Venues",
      "Photography",
      "Makeup Artists",
      "Catering",
      "Decorators",
      "Wedding Planners",
      "Music & Entertainment",
    ]);
    expect(POPULAR_SERVICES[1]).toMatchObject({ category: "PHOTOGRAPHY", to: "/user/vendors?category=photographers" });
  });

  it("asks for the cheapest listing in the city, or in all of Kerala", () => {
    expect(cheapestQuery("MAKEUP", "Kochi")).toEqual({ category: "MAKEUP", city: "Kochi", sort: "price-low", limit: 1 });
    expect(cheapestQuery("VENUE", "All Kerala")).toEqual({ category: "VENUE", sort: "price-low", limit: 1 });
  });

  it("shows the cheapest price, or why there is none", () => {
    expect(servicePrice({ isPending: true, isError: false })).toEqual({ state: "loading" });
    expect(servicePrice({ isPending: false, isError: true })).toEqual({ state: "none" });
    expect(servicePrice({ isPending: false, isError: false, data: { items: [] } })).toEqual({ state: "note", text: "No listings yet" });
    expect(servicePrice({ isPending: false, isError: false, data: { items: [{ startingPrice: null }] } })).toEqual({ state: "note", text: "Price on request" });
    expect(servicePrice({ isPending: false, isError: false, data: { items: [{ startingPrice: 50000 }] } })).toEqual({ state: "price", text: "₹50,000" });
  });
});

describe("featured venues", () => {
  it("asks for six venues in the chosen city", () => {
    expect(featuredVenuesQuery("Kochi", null)).toEqual({ category: "VENUE", city: "Kochi", sort: "recommended", limit: 6 });
    expect(featuredVenuesQuery("All Kerala", null)).toEqual({ category: "VENUE", sort: "recommended", limit: 6 });
  });

  it("puts nearby venues first when Near me is on", () => {
    expect(featuredVenuesQuery("All Kerala", { latitude: 9.93123, longitude: 76.26789 })).toEqual({
      category: "VENUE",
      lat: 9.931,
      lng: 76.268,
      radiusKm: 25,
      sort: "nearby-first",
      limit: 6,
    });
  });
});

describe("popular vendors", () => {
  it("asks for eight vendors in the chosen city", () => {
    expect(popularVendorsQuery("Kochi", null)).toEqual({ kind: "SERVICE_BASED", city: "Kochi", limit: 8 });
    expect(popularVendorsQuery("All Kerala", null)).toEqual({ kind: "SERVICE_BASED", limit: 8 });
  });

  it("puts nearby vendors first when Near me is on", () => {
    expect(popularVendorsQuery("All Kerala", { latitude: 9.93123, longitude: 76.26789 })).toEqual({
      kind: "SERVICE_BASED",
      lat: 9.931,
      lng: 76.268,
      radiusKm: 25,
      sort: "nearby-first",
      limit: 8,
    });
  });
});
