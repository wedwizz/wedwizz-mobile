import { describe, expect, it } from "vitest";
import { railCardSizes, serviceCardWidth, vendorListImageHeight, venueListImageHeight } from "./card-sizes";

describe("railCardSizes", () => {
  it("matches the reference proportions on a phone", () => {
    const { venue, vendor } = railCardSizes(360, 20);
    expect(venue).toEqual({ width: 320, imageHeight: 166 });
    expect(vendor).toEqual({ width: 252, imageHeight: 136 });
  });

  it("caps the cards on a tablet", () => {
    const { venue, vendor } = railCardSizes(1000, 20);
    expect(venue.width).toBe(420);
    expect(vendor.width).toBe(300);
  });
});

describe("vendorListImageHeight", () => {
  it("keeps the vendor photo proportion across the screen", () => {
    expect(vendorListImageHeight(360, 20)).toBe(173);
    expect(vendorListImageHeight(1000, 20)).toBe(227);
  });
});

describe("venueListImageHeight", () => {
  it("keeps the venue photo proportion across the screen, like Home's venue rail", () => {
    expect(venueListImageHeight(360, 20)).toBe(railCardSizes(360, 20).venue.imageHeight);
    expect(venueListImageHeight(1000, 20)).toBe(218);
  });
});

describe("serviceCardWidth", () => {
  it("shows about three cards on a phone, never too small or too big", () => {
    expect(serviceCardWidth(360)).toBe(115);
    expect(serviceCardWidth(300)).toBe(110);
    expect(serviceCardWidth(1000)).toBe(160);
  });
});
