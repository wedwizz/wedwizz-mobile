import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useRouter, type Href } from "expo-router";
import { space } from "@wedwizz/ui";
import { toApiError } from "@wedwizz/core/api/api-error";
import { FavouriteButton } from "@/features/user/components/favourite-button";
import { VendorCard, VenueCard } from "@/features/user/components/listing-cards";
import { MarketCard } from "@/features/user/components/market-card";
import { useFavourites, useToggleFavourite } from "@/features/user/hooks/use-favourites";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { SAMPLE_FEATURES } from "@/features/user/lib/launch";
import { vendorListImageHeight, venueListImageHeight } from "@/features/user/lib/card-sizes";
import { RequireUser } from "@/features/user/routes/guards";
import { useUserStore } from "@/features/user/store/user-store";
import { FavouritesView, GoneRowView } from "./favourites-view";
import { SHORTLIST_TARGET, shortlist, type ShortlistTab } from "./shortlist";

/** Web favourites-page.tsx. Customers only. */
export function FavouritesScreen() {
  return (
    <RequireUser>
      <Favourites />
    </RequireUser>
  );
}

function Favourites() {
  const router = useRouter();
  const goBack = useGoBack();
  const { width } = useWindowDimensions();
  const marketSaved = useUserStore((s) => s.favourites.market);
  const saved = useFavourites();
  const [tab, setTab] = useState<ShortlistTab>("venues");
  const [refreshing, setRefreshing] = useState(false);

  // A saved listing that is no longer public stays until removed; one just saved shows once the list reloads.
  const lists = shortlist(saved.data, marketSaved);
  const listings = tab !== "market";
  const count = { venues: lists.venues.length, vendors: lists.vendors.length, market: lists.market.length }[tab];
  const open = (to: string) => router.push(to as Href);
  const heart = (card: { slug: string; name: string }) => <FavouriteButton id={card.slug} label={card.name} />;
  const cards =
    tab === "venues"
      ? lists.venues.map((card) => ({ key: card.slug, node: <VenueCard card={card} imageHeight={venueListImageHeight(width, space.screen)} onPress={() => open(card.to)} favourite={heart(card)} /> }))
      : tab === "vendors"
        ? lists.vendors.map((card) => ({ key: card.slug, node: <VendorCard card={card} imageHeight={vendorListImageHeight(width, space.screen)} onPress={() => open(card.to)} favourite={heart(card)} /> }))
        : lists.market.map((item) => ({ key: item.id, node: <MarketCard item={item} /> }));

  // Only when nothing loaded: a failed background refresh keeps the saved list.
  const state = listings && saved.isPending ? "loading" : listings && !saved.data ? "error" : count === 0 ? "empty" : "items";

  const refresh = async () => {
    setRefreshing(true);
    await saved.refetch().catch(() => undefined);
    setRefreshing(false);
  };

  return (
    <FavouritesView
      onBack={goBack}
      subtitle={SAMPLE_FEATURES.market ? "Your saved venues, vendors and market items." : "Your saved venues and vendors."}
      tabs={[
        { value: "venues", label: `Venues (${lists.venues.length})` },
        { value: "vendors", label: `Vendors (${lists.vendors.length})` },
        ...(SAMPLE_FEATURES.market ? [{ value: "market" as const, label: `Market (${lists.market.length})` }] : []),
      ]}
      tab={tab}
      onChangeTab={setTab}
      state={state}
      onRetry={() => void saved.refetch()}
      cards={cards}
      columns={listings ? 1 : 2}
      emptyActionLabel={tab === "vendors" ? "Explore vendors" : `Explore ${tab}`}
      onExplore={() => router.navigate(SHORTLIST_TARGET[tab] as Href)}
      gone={listings && saved.data ? lists.gone.map((slug) => <GoneFavourite key={slug} slug={slug} />) : []}
      refreshing={refreshing}
      onRefresh={() => void refresh()}
    />
  );
}

/** A saved listing that is no longer public: it can only be removed. Its own hook keeps its writes in order (web GoneFavourite). */
function GoneFavourite({ slug }: { slug: string }) {
  const toggle = useToggleFavourite(slug);
  return (
    <GoneRowView
      slug={slug}
      onRemove={() => toggle.mutate({ saved: false })}
      removing={toggle.isPending}
      error={toggle.isError ? toApiError(toggle.error).message : ""}
    />
  );
}
