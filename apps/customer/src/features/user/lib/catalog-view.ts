import { distanceLabel, roundPoint, type GeoPoint, type NearbyRadiusKm } from "@wedwizz/core/geo/geo";
import type { CatalogCard, CatalogDetail, CatalogQuery, ProfileDetailValue, VendorType } from "@wedwizz/core/api/types";
import { SITE_CONFIG } from "@/config/site.config";
import { API_BASE_URL } from "@wedwizz/core/api/api-client";
import { VENUE_TYPE, categoryLabel, listingPath, toVendorType } from "@/features/user/lib/catalog-categories";
import { listingShareText, listingShareUrl, shareBaseUrl, type ShareContent } from "@wedwizz/core/share/listing-share";
import { ALL_KERALA } from "@/features/user/lib/location";

/** What cards show of a listing. Plain TS, so the mobile app can reuse it. */
export interface ListingCardView {
  slug: string;
  name: string;
  categoryLabel: string;
  isVenue: boolean;
  city: string;
  area: string;
  startingPrice: number | null;
  /** How the starting price is meant: a venue's hall rent per day, or a service's price onwards. */
  priceUnit: string;
  capacity: number | null;
  image: string | null;
  venueType: string | null;
  verified: boolean;
  /** Average of the visible reviews; null without reviews: cards show "New". */
  rating: number | null;
  reviewCount: number;
  /** "2.3 km away", "about 2 km away": only when searching near the customer. */
  distanceLabel: string | null;
  to: string;
}

export function toCardView(card: CatalogCard): ListingCardView {
  const isVenue = card.category === "VENUE";
  return {
    slug: card.slug,
    name: card.name,
    categoryLabel: categoryLabel(card.category),
    isVenue,
    city: card.city ?? "Kerala",
    area: card.area ?? card.city ?? "Kerala",
    startingPrice: card.startingPrice,
    priceUnit: isVenue ? "per day" : "onwards",
    capacity: card.capacity,
    image: card.coverUrl,
    venueType: card.venueType,
    verified: card.verified,
    rating: card.rating,
    reviewCount: card.reviewCount,
    distanceLabel: card.distance ? distanceLabel(card.distance) : null,
    to: listingPath(card),
  };
}

/** What a search's results area shows, from its query state. */
export type ResultsView =
  | { state: "loading" }
  | { state: "error" }
  | { state: "empty" }
  | { state: "cards"; cards: ListingCardView[]; loadMoreFailed: boolean };

/**
 * The full error page only when nothing has loaded yet: a failed "Load more" or background refetch keeps
 * the loaded cards (TanStack Query keeps their data but reports the query as errored).
 */
export function toResultsView(query: {
  isPending: boolean;
  isError: boolean;
  isFetchNextPageError: boolean;
  data?: { pages: { items: CatalogCard[] }[] };
}): ResultsView {
  if (query.isPending) return { state: "loading" };
  if (query.isError && !query.data) return { state: "error" };
  const cards = (query.data?.pages ?? []).flatMap((page) => page.items).map(toCardView);
  if (cards.length === 0) return { state: "empty" };
  return { state: "cards", cards, loadMoreFailed: query.isFetchNextPageError };
}

export function formatAnswer(value: ProfileDetailValue): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export interface ListingDetailView extends ListingCardView {
  description: string | null;
  services: string[];
  photos: string[];
  /** Answers grouped by profile section, in order. */
  sections: { title: string; rows: { label: string; value: string }[] }[];
  facilities: string[];
  /** Venue key facts: capacity, type, setting, catering. */
  stats: { label: string; value: string }[];
  platePrice: number | null;
  brand: string | null;
  mapUrl: string | null;
  moreFromOwner: ListingCardView[];
}

const answerOf = (detail: CatalogDetail, label: string) => detail.answers.find((a) => a.label === label)?.value;

export function toDetailView(detail: CatalogDetail): ListingDetailView {
  const card = toCardView(detail);
  const sections: ListingDetailView["sections"] = [];
  for (const answer of detail.answers) {
    let section = sections.find((s) => s.title === answer.section);
    if (!section) sections.push((section = { title: answer.section, rows: [] }));
    section.rows.push({ label: answer.label, value: formatAnswer(answer.value) });
  }
  const amenities = answerOf(detail, "Amenities");
  const setting = answerOf(detail, "Setting");
  const catering = answerOf(detail, "Catering");
  const vegPlate = answerOf(detail, "Vegetarian plate price (₹)");
  const stats = card.isVenue
    ? [
        ...(detail.capacity ? [{ label: "Capacity", value: `${detail.capacity} guests` }] : []),
        ...(detail.venueType ? [{ label: "Venue type", value: detail.venueType }] : []),
        ...(setting ? [{ label: "Setting", value: formatAnswer(setting) }] : []),
        ...(catering ? [{ label: "Catering", value: formatAnswer(catering) }] : []),
      ]
    : [];
  return {
    ...card,
    image: detail.coverUrl,
    description: detail.description,
    services: detail.services,
    photos: detail.photos.map((p) => p.displayUrl),
    sections,
    facilities: Array.isArray(amenities) ? amenities : [],
    stats,
    platePrice: typeof vegPlate === "number" ? vegPlate : null,
    brand: detail.brand,
    mapUrl: detail.location ? `https://www.google.com/maps?q=${detail.location.latitude},${detail.location.longitude}` : null,
    moreFromOwner: detail.moreFromOwner.map(toCardView),
  };
}

/** "More venues by Lake View Group", or by this owner without a brand. */
export function moreByOwnerTitle(brand: string | null): string {
  return brand ? `More venues by ${brand}` : "More venues by this owner";
}

export interface VendorSearchInput {
  category: string;
  q: string;
  location: string;
  price: PriceRange;
  sort: CatalogQuery["sort"];
  /** "Near me": the customer's point and radius. With a city too, the city filters and the point sorts. */
  near?: { point: GeoPoint; radiusKm: NearbyRadiusKm } | null;
}

export type PriceRange = "any" | "under-25k" | "25k-75k" | "75k-plus";

export const PRICE_RANGES: { value: PriceRange; label: string; min?: number; max?: number }[] = [
  { value: "any", label: "Any price" },
  { value: "under-25k", label: "Under ₹25,000", max: 25000 },
  { value: "25k-75k", label: "₹25,000 – ₹75,000", min: 25000, max: 75000 },
  { value: "75k-plus", label: "₹75,000 and above", min: 75000 },
];

/** The catalogue query for the vendors page: "all" means every service (not venues). */
export function vendorSearchQuery(input: VendorSearchInput): CatalogQuery {
  const type = toVendorType(input.category);
  const range = PRICE_RANGES.find((r) => r.value === input.price);
  return {
    ...(type ? { category: type } : { kind: "SERVICE_BASED" as const }),
    ...(input.location !== ALL_KERALA ? { city: input.location } : {}),
    ...(input.q.trim() ? { q: input.q.trim() } : {}),
    ...(range?.min !== undefined ? { minPrice: range.min } : {}),
    ...(range?.max !== undefined ? { maxPrice: range.max } : {}),
    ...nearQuery(input.near),
    // Near the customer, "recommended" becomes nearest first; a price sort still applies.
    sort: input.near && input.sort === "recommended" ? "distance" : input.sort,
  };
}

/** What sharing a listing sends: its share page (built from the slug, never the current address) and a line about it. */
export function shareProps(
  listing: { slug: string; name: string; category: VendorType; city: string },
  // The app has no page origin: the API URL is absolute, so it is its own origin.
  base: string = shareBaseUrl({ configured: process.env.EXPO_PUBLIC_SHARE_BASE_URL, apiBaseUrl: API_BASE_URL, pageOrigin: API_BASE_URL }),
): ShareContent {
  return {
    url: listingShareUrl(base, { slug: listing.slug, isVenue: listing.category === VENUE_TYPE }),
    title: listing.name,
    text: listingShareText({ name: listing.name, category: categoryLabel(listing.category), city: listing.city, site: SITE_CONFIG.name }),
  };
}

/** The point as sent to search: rounded to ~100 m, never more precise. */
export function nearQuery(near: VendorSearchInput["near"]): Pick<CatalogQuery, "lat" | "lng" | "radiusKm"> {
  if (!near) return {};
  const { latitude, longitude } = roundPoint(near.point);
  return { lat: latitude, lng: longitude, radiusKm: near.radiusKm };
}

export interface VenueFilters {
  /** Hall rent per day, at most. */
  priceMax: number | null;
  minCapacity: number;
}

export const DEFAULT_VENUE_FILTERS: VenueFilters = { priceMax: null, minCapacity: 0 };

export function countActiveVenueFilters(f: VenueFilters): number {
  return (f.priceMax !== null ? 1 : 0) + (f.minCapacity > 0 ? 1 : 0);
}

export function venueSearchQuery(input: { q: string; location: string; filters: VenueFilters; sort: CatalogQuery["sort"] }): CatalogQuery {
  return {
    category: "VENUE",
    ...(input.location !== ALL_KERALA ? { city: input.location } : {}),
    ...(input.q.trim() ? { q: input.q.trim() } : {}),
    ...(input.filters.priceMax !== null ? { maxPrice: input.filters.priceMax } : {}),
    ...(input.filters.minCapacity > 0 ? { capacity: input.filters.minCapacity } : {}),
    sort: input.sort,
  };
}

export const SORT_OPTIONS: { value: NonNullable<CatalogQuery["sort"]>; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];
