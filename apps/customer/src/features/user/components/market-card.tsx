import { useRouter, type Href } from "expo-router";
import { ProductCard } from "@wedwizz/ui";
import { MARKET_CATEGORIES } from "@/features/user/data/categories";
import { discountPercent } from "@/features/user/data/market";
import { useUserStore } from "@/features/user/store/user-store";
import type { MarketItem } from "@/features/user/types/user.types";
import { SessionFavouriteButton } from "./favourite-button";

/** Web MarketCard: opens the item (marked as viewed) and has the phone-only heart. */
export function MarketCard({ item }: { item: MarketItem }) {
  const router = useRouter();
  const markViewed = useUserStore((s) => s.markViewed);
  const discount = discountPercent(item);
  return (
    <ProductCard
      name={item.name}
      image={item.images[0] ?? null}
      category={MARKET_CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category}
      price={item.price}
      originalPrice={item.originalPrice}
      badge={discount > 0 ? `${discount}% off · sample` : undefined}
      onPress={() => {
        markViewed(item.id);
        router.push(`/user/market/${item.id}` as Href);
      }}
      favourite={<SessionFavouriteButton kind="market" id={item.id} label={item.name} />}
    />
  );
}
