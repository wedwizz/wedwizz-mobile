import { describe, expect, it } from "vitest";
import { MARKET_ITEMS } from "@/features/user/data/market";
import { isBrowsing, marketRails, marketResults, recentItems, relatedItems } from "./market-logic";

describe("marketResults", () => {
  it("filters by category, deals and search", () => {
    expect(marketResults(MARKET_ITEMS, "bridal", "").map((i) => i.id)).toEqual(["bridal-glam", "mehndi-bride", "bridesmaid-pack"]);
    expect(marketResults(MARKET_ITEMS, "deals", "").every((i) => i.originalPrice)).toBe(true);
    expect(marketResults(MARKET_ITEMS, "all", "MEHNDI").map((i) => i.id)).toEqual(["haldi-kit", "mehndi-bride"]);
    // The web also matches the category key.
    expect(marketResults(MARKET_ITEMS, "all", "decor")).toHaveLength(3);
    expect(marketResults(MARKET_ITEMS, "decor", "zzz")).toEqual([]);
  });

  it("browses with no chip and no search", () => {
    expect(isBrowsing("all", "")).toBe(true);
    expect(isBrowsing("deals", "")).toBe(false);
    expect(isBrowsing("all", "kit")).toBe(false);
  });
});

describe("marketRails", () => {
  it("puts the five biggest discounts first and the rest in Popular deals", () => {
    const rails = marketRails(MARKET_ITEMS);
    expect(rails.map((r) => r.title)).toEqual([
      "Featured offers",
      "Wedding essentials",
      "Invitations & gifting",
      "Decor packages",
      "Photography packages",
      "Bridal services",
      "Popular deals",
    ]);
    const featured = rails[0].items;
    expect(featured).toHaveLength(5);
    const deals = MARKET_ITEMS.filter((i) => i.originalPrice).length;
    expect(rails[6].items).toHaveLength(deals - 5);
  });
});

describe("item helpers", () => {
  it("keeps recently viewed order and skips unknown ids", () => {
    expect(recentItems(MARKET_ITEMS, ["candid-day", "gone", "haldi-kit"]).map((i) => i.id)).toEqual(["candid-day", "haldi-kit"]);
  });

  it("finds others in the same category", () => {
    const item = MARKET_ITEMS.find((i) => i.id === "candid-day")!;
    expect(relatedItems(MARKET_ITEMS, item).map((i) => i.id)).toEqual(["prewedding-shoot"]);
  });
});
