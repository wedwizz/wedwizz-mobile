import type { Favourite } from "@wedwizz/core/api/types";
import { MARKET_ITEMS } from "@/features/user/data/market";
import { VENUE_TYPE } from "@/features/user/lib/catalog-categories";
import { toCardView, type ListingCardView } from "@/features/user/lib/catalog-view";
import type { MarketItem } from "@/features/user/types/user.types";

export type ShortlistTab = "venues" | "vendors" | "market";

export interface Shortlist {
  venues: ListingCardView[];
  vendors: ListingCardView[];
  /** Saved listings that are no longer public: they can only be removed. */
  gone: string[];
  market: MarketItem[];
}

/**
 * The Shortlisted page's lists (web favourites-page.tsx): saved venues and vendors still listed, the ones that are
 * gone, and the market items saved on this phone.
 */
export function shortlist(favourites: Favourite[] | undefined, marketSaved: string[]): Shortlist {
  const all = favourites ?? [];
  const listed = all.flatMap((f) => (f.listing ? [f.listing] : []));
  return {
    venues: listed.filter((c) => c.category === VENUE_TYPE).map(toCardView),
    vendors: listed.filter((c) => c.category !== VENUE_TYPE).map(toCardView),
    gone: all.filter((f) => f.listing === null).map((f) => f.slug),
    market: MARKET_ITEMS.filter((m) => marketSaved.includes(m.id)),
  };
}

export const SHORTLIST_TARGET: Record<ShortlistTab, string> = { venues: "/user/venues", vendors: "/user/vendors", market: "/user/market" };
