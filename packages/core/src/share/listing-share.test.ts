import { describe, expect, it } from "vitest";
import { listingShareText, listingShareUrl, shareBaseUrl, whatsappShareLink } from "./listing-share";

const ORIGIN = "https://app.example.com";

describe("listing share link", () => {
  it("points venues and vendors to their share pages", () => {
    expect(listingShareUrl(ORIGIN, { slug: "lake-view-kochi", isVenue: true })).toBe(`${ORIGIN}/share/venues/lake-view-kochi`);
    expect(listingShareUrl(`${ORIGIN}/`, { slug: "lumen-stories-kochi", isVenue: false })).toBe(`${ORIGIN}/share/vendors/lumen-stories-kochi`);
  });

  it("uses only the base's origin, so nothing else can end up in the link", () => {
    expect(listingShareUrl(`${ORIGIN}/some/path?x=1#y`, { slug: "lumen", isVenue: false })).toBe(`${ORIGIN}/share/vendors/lumen`);
  });

  it("comes from VITE_SHARE_BASE_URL, else the API's origin", () => {
    const pageOrigin = "https://app.example.com";
    expect(shareBaseUrl({ configured: "https://wedwizz.in", apiBaseUrl: "https://api.example.com/api/v1", pageOrigin })).toBe("https://wedwizz.in");
    expect(shareBaseUrl({ apiBaseUrl: "https://api.example.com/api/v1", pageOrigin })).toBe("https://api.example.com");
    expect(shareBaseUrl({ configured: "", apiBaseUrl: "https://api.example.com/api/v1", pageOrigin })).toBe("https://api.example.com");
    // A relative API base (the dev proxy): this page's origin.
    expect(shareBaseUrl({ apiBaseUrl: "/api/v1", pageOrigin })).toBe(pageOrigin);
  });
});

describe("share text", () => {
  it("names the business, its category and city", () => {
    expect(listingShareText({ name: "Lumen Stories", category: "Photographer", city: "Kochi", site: "WedWizz" })).toBe("Lumen Stories · Photographer in Kochi on WedWizz");
  });

  it("fills WhatsApp with the line and the link, encoded", () => {
    expect(whatsappShareLink("Lumen & Co · Venue in Kochi", `${ORIGIN}/user/venues/lumen`)).toBe(
      "https://wa.me/?text=Lumen%20%26%20Co%20%C2%B7%20Venue%20in%20Kochi%20https%3A%2F%2Fapp.example.com%2Fuser%2Fvenues%2Flumen",
    );
  });
});
