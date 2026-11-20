import { describe, expect, it } from "vitest";
import { copyName, formatPackagePrice, itemsFromText, movedIds } from "./package-view";

describe("package view", () => {
  it("shows the price with its unit", () => {
    expect(formatPackagePrice({ price: 65000, priceUnit: "PER_EVENT" })).toBe("₹65,000 per event");
    expect(formatPackagePrice({ price: 1250000, priceUnit: "PER_DAY" })).toBe("₹12,50,000 per day");
    expect(formatPackagePrice({ price: 850, priceUnit: "PER_PLATE" })).toBe("₹850 per plate");
  });

  it("takes items one per line, trimmed, blank lines dropped, each once", () => {
    expect(itemsFromText(" Candid photography \n\nWedding album\nwedding ALBUM\n  ")).toEqual(["Candid photography", "Wedding album"]);
    expect(itemsFromText("")).toEqual([]);
  });

  it("names a copy within the length limit", () => {
    expect(copyName("Classic Wedding")).toBe("Classic Wedding (copy)");
    const long = copyName("x".repeat(60));
    expect(long).toHaveLength(60);
    expect(long.endsWith(" (copy)")).toBe(true);
  });

  it("moves a package up or down, not past either end", () => {
    expect(movedIds(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(movedIds(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
    expect(movedIds(["a", "b", "c"], 0, -1)).toBeNull();
    expect(movedIds(["a", "b", "c"], 2, 1)).toBeNull();
  });
});
