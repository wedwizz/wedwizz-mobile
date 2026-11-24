import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { MarketCard } from "@/features/user/components/market-card";
import { SessionFavouriteButton } from "@/features/user/components/favourite-button";
import { MARKET_ITEMS, discountPercent } from "@/features/user/data/market";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { paramString } from "@/features/user/lib/auth-gate";
import { MARKET_CATEGORIES } from "@/features/user/data/categories";
import { relatedItems } from "./market-logic";
import { MarketItemView } from "./market-item-view";

// Past this, the photo has scrolled away and the status bar turns dark (as the listing pages).
const HERO_SCROLLED = 260;

/** Web market-detail-page.tsx. Open to guests. */
export function MarketItemScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const id = paramString(useLocalSearchParams<{ id?: string }>().id);
  const item = MARKET_ITEMS.find((i) => i.id === id);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [overPhoto, setOverPhoto] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(overPhoto && item ? "light" : "dark");
      return () => setStatusBarStyle("dark");
    }, [overPhoto, item]),
  );

  const discount = item ? discountPercent(item) : 0;
  return (
    <MarketItemView
      onBack={goBack}
      content={
        item
          ? {
              name: item.name,
              photos: item.images,
              category: MARKET_CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category,
              price: item.price,
              originalPrice: item.originalPrice,
              discount: discount > 0 ? `${discount}% off · sample` : null,
              description: item.description,
              includes: item.includes,
              related: relatedItems(MARKET_ITEMS, item).map((r) => ({ key: r.id, node: <MarketCard item={r} /> })),
              // Web: "View all" opens the market.
              onViewAllRelated: () => router.navigate("/user/market" as Href),
            }
          : null
      }
      heart={item ? <SessionFavouriteButton kind="market" id={item.id} label={item.name} diameter={44} /> : null}
      lightboxIndex={lightbox}
      onOpenPhoto={setLightbox}
      onCloseLightbox={() => setLightbox(null)}
      onScrollY={(y) => {
        const next = y < HERO_SCROLLED;
        if (next !== overPhoto) setOverPhoto(next);
      }}
    />
  );
}
