import { describe, expect, it } from "vitest";
import { INSPIRATION_ITEMS } from "@/features/user/data/planner";
import { INSPIRATION_FILTERS, inspirationItems } from "./inspiration-logic";

describe("inspirationItems", () => {
  it("shows all, saved, or one category", () => {
    expect(inspirationItems(INSPIRATION_ITEMS, "all", [])).toHaveLength(INSPIRATION_ITEMS.length);
    expect(inspirationItems(INSPIRATION_ITEMS, "saved", ["insp-0-1", "insp-2-0"]).map((i) => i.id)).toEqual(["insp-0-1", "insp-2-0"]);
    expect(inspirationItems(INSPIRATION_ITEMS, "saved", [])).toEqual([]);
    expect(inspirationItems(INSPIRATION_ITEMS, "Bridal Makeup", []).every((i) => i.category === "Bridal Makeup")).toBe(true);
  });

  it("offers All, Saved, then the categories", () => {
    expect(INSPIRATION_FILTERS.slice(0, 3).map((f) => f.label)).toEqual(["All", "Saved", "Wedding Decor"]);
  });
});
