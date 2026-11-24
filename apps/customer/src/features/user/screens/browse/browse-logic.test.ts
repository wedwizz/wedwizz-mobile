import { describe, expect, it } from "vitest";
import { ALL_KERALA } from "@/features/user/lib/location";
import { vendorEmptyState, vendorParams, vendorsTitle } from "./browse-logic";

describe("vendors page params", () => {
  it("keeps the other param and leaves out 'all' and an empty search", () => {
    expect(vendorParams({ category: "all", q: "" }, { category: "makeup" })).toEqual({ category: "makeup", q: undefined });
    expect(vendorParams({ category: "makeup", q: "" }, { q: "bridal" })).toEqual({ category: "makeup", q: "bridal" });
    expect(vendorParams({ category: "makeup", q: "bridal" }, { category: "all" })).toEqual({ category: undefined, q: "bridal" });
    expect(vendorParams({ category: "makeup", q: "bridal" }, { q: "" })).toEqual({ category: "makeup", q: undefined });
  });
});

describe("vendors page title", () => {
  it("names the chosen category, else all vendors", () => {
    expect(vendorsTitle("photographers")).toBe("Photographers");
    expect(vendorsTitle("all")).toBe("Wedding Vendors");
    expect(vendorsTitle("unknown")).toBe("Wedding Vendors");
  });
});

describe("vendors empty state", () => {
  it("offers a wider radius near the customer, then browsing by city", () => {
    expect(vendorEmptyState(true, ALL_KERALA, 10)).toMatchObject({ title: "No vendors within 10 km", actionLabel: "Search within 25 km", action: { type: "radius", km: 25 } });
    expect(vendorEmptyState(true, ALL_KERALA, 50)).toMatchObject({ actionLabel: "Browse by city", action: { type: "browse-by-city" } });
  });

  it("resets the filters otherwise, including near the customer with a city chosen", () => {
    expect(vendorEmptyState(false, ALL_KERALA, 25)).toMatchObject({ title: "No vendors found", action: { type: "reset" } });
    expect(vendorEmptyState(true, "Kochi", 25)).toMatchObject({ action: { type: "reset" } });
  });
});
