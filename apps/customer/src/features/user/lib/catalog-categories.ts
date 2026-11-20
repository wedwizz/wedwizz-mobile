import type { VendorType } from "@wedwizz/core/api/types";
import type { VendorCategoryKey } from "@/features/user/types/user.types";

export interface VendorCategory {
  key: VendorCategoryKey;
  type: VendorType;
  label: string;
  singular: string;
}

/**
 * The one mapping between the customer app's category keys (in URLs) and the server's categories.
 * Venues are listings with category VENUE and have their own pages.
 */
export const VENDOR_CATEGORIES: VendorCategory[] = [
  { key: "photographers", type: "PHOTOGRAPHY", label: "Photographers", singular: "Photographer" },
  { key: "makeup", type: "MAKEUP", label: "Makeup Artists", singular: "Makeup Artist" },
  { key: "planners", type: "WEDDING_PLANNING", label: "Wedding Planners", singular: "Wedding Planner" },
  { key: "decorators", type: "DECORATION", label: "Decorators", singular: "Decorator" },
  { key: "catering", type: "CATERING", label: "Caterers", singular: "Caterer" },
  { key: "music", type: "DJ", label: "Music & Entertainment", singular: "Music & Entertainment" },
];

export const VENUE_TYPE: VendorType = "VENUE";

/** The server category for a URL key, or undefined for "all" and unknown keys. */
export function toVendorType(key: string): VendorType | undefined {
  return VENDOR_CATEGORIES.find((c) => c.key === key)?.type;
}

export function toCategoryKey(type: VendorType): VendorCategoryKey | "venues" {
  return type === VENUE_TYPE ? "venues" : (VENDOR_CATEGORIES.find((c) => c.type === type)?.key ?? "photographers");
}

/** "Photographer", "Venue", …: one listing of the category. */
export function categoryLabel(type: VendorType): string {
  return type === VENUE_TYPE ? "Venue" : (VENDOR_CATEGORIES.find((c) => c.type === type)?.singular ?? type);
}

/** "Photographers", "Venues", "Music & Entertainment", …: the category as a whole. */
export function categoryPluralLabel(type: VendorType): string {
  return type === VENUE_TYPE ? "Venues" : (VENDOR_CATEGORIES.find((c) => c.type === type)?.label ?? type);
}

/** Where a listing's page is. */
export function listingPath(card: { slug: string; category: VendorType }): string {
  return card.category === VENUE_TYPE ? `/user/venues/${card.slug}` : `/user/vendors/${card.slug}`;
}
