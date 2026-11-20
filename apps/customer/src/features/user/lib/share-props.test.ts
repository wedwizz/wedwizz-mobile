import { describe, expect, it } from "vitest";
import { shareProps } from "@/features/user/lib/catalog-view";

// Moved from the web's lib/share/listing-share.test.ts: shareProps lives in the customer app, not @wedwizz/core.
const ORIGIN = "https://app.example.com";

describe("shareProps", () => {
  it("builds the link and text of a listing, under the WedWizz name", () => {
    expect(shareProps({ slug: "lumen-stories-kochi", name: "Lumen Stories", category: "PHOTOGRAPHY", city: "Kochi" }, ORIGIN)).toEqual({
      url: `${ORIGIN}/share/vendors/lumen-stories-kochi`,
      title: "Lumen Stories",
      text: "Lumen Stories · Photographer in Kochi on WedWizz",
    });
    const venue = shareProps({ slug: "lake-view-kochi", name: "Lake View", category: "VENUE", city: "Kochi" }, ORIGIN);
    expect(venue.text).toBe("Lake View · Venue in Kochi on WedWizz");
    expect(venue.url).toBe(`${ORIGIN}/share/venues/lake-view-kochi`);
  });
});
