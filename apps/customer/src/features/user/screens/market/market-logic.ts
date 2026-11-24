/** Decisions from the web's market-page.tsx and market-detail-page.tsx (sample items), kept out of the screens so they can be tested. */
import { discountPercent } from "@/features/user/data/market";
import type { MarketCategoryKey, MarketItem } from "@/features/user/types/user.types";

/** Items for a category chip ("deals": those with an earlier price) and a search on the name or category key. */
export function marketResults(items: readonly MarketItem[], category: string, query: string): MarketItem[] {
  const q = query.toLowerCase();
  return items.filter(
    (i) =>
      (category === "all" || (category === "deals" ? !!i.originalPrice : i.category === category)) &&
      (!q || i.name.toLowerCase().includes(q) || i.category.includes(q)),
  );
}

/** Showing the rails: no chip chosen and no search. */
export const isBrowsing = (category: string, query: string): boolean => category === "all" && !query;

export interface MarketRail {
  title: string;
  /** The chip its "View all" chooses. */
  category: string;
  items: MarketItem[];
}

/** The web's rails, in its order; empty ones are left out. Offers are sorted by discount, the top five first. */
export function marketRails(items: readonly MarketItem[]): MarketRail[] {
  const byCategory = (key: MarketCategoryKey) => items.filter((i) => i.category === key);
  const deals = items.filter((i) => i.originalPrice).sort((a, b) => discountPercent(b) - discountPercent(a));
  const rails: MarketRail[] = [
    { title: "Featured offers", category: "deals", items: deals.slice(0, 5) },
    { title: "Wedding essentials", category: "essentials", items: byCategory("essentials") },
    { title: "Invitations & gifting", category: "invitations", items: byCategory("invitations") },
    { title: "Decor packages", category: "decor", items: byCategory("decor") },
    { title: "Photography packages", category: "photography", items: byCategory("photography") },
    { title: "Bridal services", category: "bridal", items: byCategory("bridal") },
    { title: "Popular deals", category: "deals", items: deals.slice(5) },
  ];
  return rails.filter((r) => r.items.length > 0);
}

/** Recently opened items, newest first, skipping any no longer listed. */
export function recentItems(items: readonly MarketItem[], viewedIds: readonly string[]): MarketItem[] {
  return viewedIds.map((id) => items.find((i) => i.id === id)).filter((i): i is MarketItem => !!i);
}

/** "You may also like": up to four others from the same category. */
export const relatedItems = (items: readonly MarketItem[], item: MarketItem): MarketItem[] =>
  items.filter((i) => i.category === item.category && i.id !== item.id).slice(0, 4);
