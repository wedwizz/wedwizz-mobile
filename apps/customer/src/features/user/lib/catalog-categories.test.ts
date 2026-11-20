import { describe, expect, it } from "vitest";
import { VENDOR_CATEGORIES, categoryLabel, categoryPluralLabel, listingPath, toCategoryKey, toVendorType } from "./catalog-categories";

describe("catalog categories", () => {
  it("maps every customer key to a server category and back", () => {
    for (const c of VENDOR_CATEGORIES) {
      expect(toVendorType(c.key)).toBe(c.type);
      expect(toCategoryKey(c.type)).toBe(c.key);
    }
  });

  it("has no mehndi until the server has that category", () => {
    expect(VENDOR_CATEGORIES.map((c) => c.key as string)).not.toContain("mehndi");
    expect(toVendorType("mehndi")).toBeUndefined();
  });

  it("treats 'all' and unknown keys as no category", () => {
    expect(toVendorType("all")).toBeUndefined();
    expect(toVendorType("venues")).toBeUndefined();
  });

  it("keeps venues apart from vendors", () => {
    expect(toCategoryKey("VENUE")).toBe("venues");
    expect(categoryLabel("VENUE")).toBe("Venue");
    expect(categoryLabel("DJ")).toBe("Music & Entertainment");
    expect(listingPath({ slug: "lake-view-kochi", category: "VENUE" })).toBe("/user/venues/lake-view-kochi");
    expect(listingPath({ slug: "lumen-stories-kochi", category: "PHOTOGRAPHY" })).toBe("/user/vendors/lumen-stories-kochi");
  });

  it("names a category as a whole from its own plural, not by adding an s", () => {
    expect(categoryPluralLabel("PHOTOGRAPHY")).toBe("Photographers");
    expect(categoryPluralLabel("CATERING")).toBe("Caterers");
    expect(categoryPluralLabel("DJ")).toBe("Music & Entertainment");
    expect(categoryPluralLabel("VENUE")).toBe("Venues");
  });
});
