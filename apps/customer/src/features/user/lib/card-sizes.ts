/**
 * Listing card sizes, measured from the user's reference screenshot (2026-11-23; size only, not style or data). Rails:
 * a venue card spans the screen inside the side padding; a vendor card is ~70% of the screen, so the next one peeks in.
 * Photo heights keep the screenshot's proportions. Capped so tablets don't get giant cards.
 */
export interface CardSize {
  width: number;
  imageHeight: number;
}

const VENUE_PHOTO_RATIO = 0.52;
const VENDOR_PHOTO_RATIO = 0.54;

/** Home's vendor rails and the detail page's "Similar" rails. */
export function railCardSizes(screenWidth: number, sidePadding: number): { venue: CardSize; vendor: CardSize } {
  const venueWidth = Math.min(Math.round(screenWidth - sidePadding * 2), 420);
  const vendorWidth = Math.min(Math.round(screenWidth * 0.7), 300);
  return {
    venue: { width: venueWidth, imageHeight: Math.round(venueWidth * VENUE_PHOTO_RATIO) },
    vendor: { width: vendorWidth, imageHeight: Math.round(vendorWidth * VENDOR_PHOTO_RATIO) },
  };
}

/** The Vendors page: one card per row across the screen, the photo in the vendor card's proportion. */
export function vendorListImageHeight(screenWidth: number, sidePadding: number): number {
  return Math.round(Math.min(screenWidth - sidePadding * 2, 420) * VENDOR_PHOTO_RATIO);
}

/** The Venues page: one card per row across the screen, the photo in the venue card's proportion. */
export function venueListImageHeight(screenWidth: number, sidePadding: number): number {
  return Math.round(Math.min(screenWidth - sidePadding * 2, 420) * VENUE_PHOTO_RATIO);
}

/** Home's "Popular Services" cards: about three across a phone, wide enough for a lakh price on one line. */
export function serviceCardWidth(screenWidth: number): number {
  return Math.min(Math.max(Math.round(screenWidth * 0.32), 110), 160);
}
