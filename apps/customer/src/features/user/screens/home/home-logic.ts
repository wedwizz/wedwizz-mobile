/**
 * Home's decisions, from the web's home-page.tsx, kept out of the screen so they can be tested without rendering.
 */
import type { CatalogCard, CatalogQuery, Checklist, Favourite, VendorType } from "@wedwizz/core/api/types";
import { formatINR } from "@wedwizz/core/format";
import { DEFAULT_NEARBY_RADIUS_KM, type GeoPoint } from "@wedwizz/core/geo/geo";
import { DEFAULT_VENUE_FILTERS, nearQuery, venueSearchQuery } from "@/features/user/lib/catalog-view";
import { VENDOR_CATEGORIES, VENUE_TYPE } from "@/features/user/lib/catalog-categories";
import { ALL_KERALA } from "@/features/user/lib/location";

/** The reference's names where it has one; otherwise the category's own. */
const SERVICE_LABELS: Partial<Record<string, string>> = { photographers: "Photography", catering: "Catering" };

/** The hero search's category choice (web <select>): all services, venues, then each vendor category. */
export const SEARCH_CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All services" },
  { value: "venues", label: "Venues" },
  ...VENDOR_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
];

/**
 * Where the hero search goes (web `search`): venues → the Venues tab with `q`; anything else → the Vendors tab with
 * the category (none for "all") and `q`. The web leaves a bare "?" when both are empty; this drops it.
 */
export function homeSearchPath(category: string, query: string): string {
  const q = query.trim();
  const qs = q ? `q=${encodeURIComponent(q)}` : "";
  if (category === "venues") return `/user/venues${qs ? `?${qs}` : ""}`;
  const params = [category === "all" ? "" : `category=${category}`, qs].filter(Boolean).join("&");
  return `/user/vendors${params ? `?${params}` : ""}`;
}

export interface PlannerCounts {
  tasks: number;
  done: number;
  /** As the Shortlisted page counts them: listings still public. */
  saved: number;
}

/** The live counts on the planner tiles (0 for a guest or while loading, as the web). */
export function plannerCounts(checklist: Pick<Checklist, "tasks"> | undefined, favourites: Pick<Favourite, "listing">[] | undefined): PlannerCounts {
  const tasks = checklist?.tasks ?? [];
  return {
    tasks: tasks.length,
    done: tasks.filter((t) => t.done).length,
    saved: (favourites ?? []).filter((f) => f.listing).length,
  };
}

/** The chat icon's dot: any conversation with messages the customer hasn't read. */
export function hasUnread(enquiries: { unreadCount: number }[] | undefined): boolean {
  return (enquiries ?? []).some((e) => e.unreadCount > 0);
}

export interface PopularService {
  /** The category key (CATEGORY_IMAGES, routes). */
  key: string;
  /** The card's name (home reference 2026-11-24). */
  label: string;
  category: VendorType;
  /** Where the card goes (the category's page, as the category row). */
  to: string;
}

/** "Popular Services for Your Wedding": venues and the main vendor categories. */
export const POPULAR_SERVICES: PopularService[] = [
  { key: "venues", label: "Wedding Venues", category: VENUE_TYPE, to: "/user/venues" },
  ...(["photographers", "makeup", "catering", "decorators", "planners", "music"] as const).map((key) => {
    const c = VENDOR_CATEGORIES.find((v) => v.key === key)!;
    return { key, label: SERVICE_LABELS[key] ?? c.label, category: c.type, to: `/user/vendors?category=${key}` };
  }),
];

/**
 * The query for a service's "From" price: its cheapest listing in the chosen city (all of Kerala when none). The server
 * sorts listings without a price last, so a null price here means none in the category has one.
 */
export function cheapestQuery(category: VendorType, location: string): CatalogQuery {
  return { category, ...(location !== ALL_KERALA ? { city: location } : {}), sort: "price-low", limit: 1 };
}

export type ServicePrice = { state: "loading" } | { state: "price"; text: string } | { state: "note"; text: string } | { state: "none" };

/** What a service card shows under its name. A failed load shows nothing (pull to refresh tries again). */
export function servicePrice(q: { isPending: boolean; isError: boolean; data?: { items: Pick<CatalogCard, "startingPrice">[] } }): ServicePrice {
  if (q.isPending) return { state: "loading" };
  if (q.isError || !q.data) return { state: "none" };
  const first = q.data.items[0];
  if (!first) return { state: "note", text: "No listings yet" };
  if (first.startingPrice === null) return { state: "note", text: "Price on request" };
  return { state: "price", text: formatINR(first.startingPrice) };
}

/**
 * Home's Featured Venues: six from the chosen city; with Near me on, the same order as the Venues page (venues within the
 * nearby radius nearest first, then the rest).
 */
export function featuredVenuesQuery(location: string, nearPoint: GeoPoint | null): CatalogQuery {
  return {
    ...venueSearchQuery({
      q: "",
      location,
      filters: DEFAULT_VENUE_FILTERS,
      sort: "recommended",
      near: nearPoint ? { point: nearPoint, radiusKm: DEFAULT_NEARBY_RADIUS_KM } : null,
    }),
    limit: 6,
  };
}

/**
 * Home's Popular Vendors: eight from the chosen city; with Near me on, nearby-first (vendors within the nearby radius
 * nearest first, then the rest in the recommended order).
 */
export function popularVendorsQuery(location: string, nearPoint: GeoPoint | null): CatalogQuery {
  return {
    kind: "SERVICE_BASED",
    ...(location !== ALL_KERALA ? { city: location } : {}),
    ...(nearPoint ? { ...nearQuery({ point: nearPoint, radiusKm: DEFAULT_NEARBY_RADIUS_KM }), sort: "nearby-first" as const } : {}),
    limit: 8,
  };
}
