/**
 * Decisions from the web's venues-page.tsx and vendors-page.tsx, kept out of the screens so they can be tested.
 */
import { NEARBY_RADII_KM, type NearbyRadiusKm } from "@wedwizz/core/geo/geo";
import { VENDOR_CATEGORIES } from "@/features/user/lib/catalog-categories";
import { ALL_KERALA } from "@/features/user/lib/location";

export const VENDOR_CATEGORY_OPTIONS = [{ value: "all", label: "All" }, ...VENDOR_CATEGORIES.map((c) => ({ value: c.key as string, label: c.label }))];

export const RADIUS_OPTIONS = NEARBY_RADII_KM.map((km) => ({ value: String(km), label: `${km} km` }));

// The venue's hall rent per day (its starting price). Web venue-filter-drawer.tsx.
export const VENUE_PRICE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "50000", label: "Up to ₹50,000" },
  { value: "100000", label: "Up to ₹1 lakh" },
  { value: "200000", label: "Up to ₹2 lakh" },
];
export const VENUE_CAPACITY_OPTIONS = [
  { value: "0", label: "Any" },
  { value: "400", label: "400+" },
  { value: "700", label: "700+" },
  { value: "1000", label: "1000+" },
];

/** "Photographers", …, or "Wedding Vendors" for all (web title). */
export function vendorsTitle(category: string): string {
  return VENDOR_CATEGORIES.find((c) => c.key === category)?.label ?? "Wedding Vendors";
}

/**
 * The Vendors page's URL params after a change (web `update`): category (left out for "all") and q (left out when
 * empty). Undefined removes the param.
 */
export function vendorParams(current: { category: string; q: string }, next: { category?: string; q?: string }): { category: string | undefined; q: string | undefined } {
  const merged = { ...current, ...next };
  return { category: merged.category !== "all" ? merged.category : undefined, q: merged.q ? merged.q : undefined };
}

export type VendorEmptyAction = { type: "radius"; km: NearbyRadiusKm } | { type: "browse-by-city" } | { type: "reset" };

export interface VendorEmpty {
  title: string;
  body: string;
  actionLabel: string;
  action: VendorEmptyAction;
}

/**
 * The empty state (web nearEmptyState): near the customer with no city chosen, offer a wider radius, then browsing
 * by city; otherwise "No vendors found" with "Reset filters".
 */
export function vendorEmptyState(near: boolean, location: string, radiusKm: NearbyRadiusKm): VendorEmpty {
  if (near && location === ALL_KERALA) {
    const wider = NEARBY_RADII_KM.find((km) => km > radiusKm);
    return wider
      ? { title: `No vendors within ${radiusKm} km`, body: "Try a wider area, or browse by city.", actionLabel: `Search within ${wider} km`, action: { type: "radius", km: wider } }
      : { title: `No vendors within ${radiusKm} km`, body: "Browse by city instead.", actionLabel: "Browse by city", action: { type: "browse-by-city" } };
  }
  return { title: "No vendors found", body: "Try another category or price range, or choose another city on Home.", actionLabel: "Reset filters", action: { type: "reset" } };
}
