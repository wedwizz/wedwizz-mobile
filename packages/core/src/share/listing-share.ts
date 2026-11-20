/**
 * What is sent when a customer shares a listing. Plain TS, so the mobile app can share the same link and text
 * (React Native `Share.share`).
 */
export interface ShareContent {
  url: string;
  title: string;
  text: string;
}

/** Who serves the share pages: `VITE_SHARE_BASE_URL`, else the API's origin (a relative API base means this page's). */
export function shareBaseUrl({ configured, apiBaseUrl, pageOrigin }: { configured?: string; apiBaseUrl: string; pageOrigin: string }): string {
  return new URL(configured || apiBaseUrl, pageOrigin).origin;
}

/**
 * The link everyone shares: the backend's page for this listing, which gives chat apps a preview card and sends people
 * on to the app. Built from the slug alone, so filters or visitor state can never leak into it.
 */
export function listingShareUrl(base: string, listing: { slug: string; isVenue: boolean }): string {
  return `${new URL(base).origin}/share/${listing.isVenue ? "venues" : "vendors"}/${encodeURIComponent(listing.slug)}`;
}

/** "Lumen Stories · Photographer in Kochi on WedWizz". */
export function listingShareText({ name, category, city, site }: { name: string; category: string; city: string; site: string }): string {
  return `${name} · ${category} in ${city} on ${site}`;
}

/** `https://wa.me/?text=…`: opens WhatsApp to pick who to send it to, with the line and the link filled in. */
export function whatsappShareLink(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}
