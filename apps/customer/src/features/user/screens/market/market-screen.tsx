import { useLocalSearchParams, useRouter } from "expo-router";
import { MarketCard } from "@/features/user/components/market-card";
import { MARKET_ITEMS } from "@/features/user/data/market";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { useSearchText } from "@/features/user/hooks/use-search-text";
import { paramString } from "@/features/user/lib/auth-gate";
import { useUserStore } from "@/features/user/store/user-store";
import { vendorParams } from "@/features/user/screens/browse/browse-logic";
import type { MarketItem } from "@/features/user/types/user.types";
import { MARKET_CATEGORIES } from "@/features/user/data/categories";
import { isBrowsing, marketRails, marketResults, recentItems } from "./market-logic";
import { MarketView } from "./market-view";

const MARKET_CHIPS = MARKET_CATEGORIES.map((c) => ({ value: c.key as string, label: c.label }));

const card = (item: MarketItem) => ({ key: item.id, node: <MarketCard item={item} /> });

/** Web market-page.tsx. Open to guests; the items are samples kept in the app. Category and search live in the route params, as the web's URL. */
export function MarketScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const category = paramString(params.category) ?? "all";
  const q = paramString(params.q) ?? "";
  const recentlyViewed = useUserStore((s) => s.recentlyViewed);

  const update = (next: { category?: string; q?: string }) => router.setParams(vendorParams({ category, q }, next));
  const [search, setSearch] = useSearchText(q, (text) => update({ q: text }));

  const results = marketResults(MARKET_ITEMS, category, q);
  const body = isBrowsing(category, q)
    ? {
        kind: "browse" as const,
        rails: marketRails(MARKET_ITEMS).map((rail) => ({ title: rail.title, onViewAll: () => update({ category: rail.category }), cards: rail.items.map(card) })),
        recent: recentItems(MARKET_ITEMS, recentlyViewed).map(card),
      }
    : results.length === 0
      ? {
          kind: "empty" as const,
          onShowEverything: () => {
            setSearch("");
            router.setParams({ category: undefined, q: undefined });
          },
        }
      : { kind: "results" as const, cards: results.map(card) };

  return (
    <MarketView
      onBack={goBack}
      search={search}
      onChangeSearch={setSearch}
      chips={MARKET_CHIPS}
      category={category}
      onChangeCategory={(value) => update({ category: value })}
      body={body}
    />
  );
}
