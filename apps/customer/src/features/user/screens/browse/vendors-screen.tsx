import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import type { CatalogSort } from "@wedwizz/core/api/types";
import { DEFAULT_NEARBY_RADIUS_KM, type NearbyRadiusKm } from "@wedwizz/core/geo/geo";
import { space } from "@wedwizz/ui";
import { FavouriteButton } from "@/features/user/components/favourite-button";
import { NearMeButton } from "@/features/user/components/near-me";
import { resultCount, useCatalogSearch } from "@/features/user/hooks/use-catalog";
import { useEnquiries } from "@/features/user/hooks/use-enquiries";
import { useSearchText } from "@/features/user/hooks/use-search-text";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { paramString } from "@/features/user/lib/auth-gate";
import { vendorListImageHeight } from "@/features/user/lib/card-sizes";
import { PRICE_RANGES, SORT_OPTIONS, toResultsView, vendorSearchQuery, type PriceRange } from "@/features/user/lib/catalog-view";
import { ALL_KERALA, locationLabel } from "@/features/user/lib/location";
import { useUserStore } from "@/features/user/store/user-store";
import { RADIUS_OPTIONS, VENDOR_CATEGORY_OPTIONS, vendorEmptyState, vendorParams, vendorsTitle } from "./browse-logic";
import { hasUnread } from "../home/home-logic";
import { VendorsView } from "./vendors-view";

/** Web vendors-page.tsx. Category and search are the route's `category` and `q` params (Home's links send them). */
export function VendorsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const category = paramString(params.category) ?? "all";
  const q = paramString(params.q) ?? "";
  const location = useUserStore((s) => s.location);
  const nearPoint = useUserStore((s) => s.nearPoint);
  const signedIn = useUserSession().status === "authenticated";
  const enquiries = useEnquiries();
  const setNearPoint = useUserStore((s) => s.setNearPoint);
  const [radiusKm, setRadiusKm] = useState<NearbyRadiusKm>(DEFAULT_NEARBY_RADIUS_KM);
  const [price, setPrice] = useState<PriceRange>("any");
  const [sort, setSort] = useState<CatalogSort>("recommended");
  const [refreshing, setRefreshing] = useState(false);

  const update = (next: { category?: string; q?: string }) => router.setParams(vendorParams({ category, q }, next));
  const [search, setSearch] = useSearchText(q, (text) => update({ q: text }));

  const near = nearPoint ? { point: nearPoint, radiusKm } : null;
  const results = useCatalogSearch(vendorSearchQuery({ category, q, location, price, sort, near }));
  // Nearest first leaves nobody out for distance: an empty list then has the usual reasons. A price sort near the
  // customer still stays within the radius, so its empty state offers a wider one.
  const nearestFirst = !!nearPoint && sort === "recommended";
  const empty = vendorEmptyState(!!nearPoint && !nearestFirst, location, radiusKm);

  const reset = () => {
    setPrice("any");
    setSearch("");
    router.setParams({ category: undefined, q: undefined });
  };

  const refresh = async () => {
    setRefreshing(true);
    await results.refetch().catch(() => undefined);
    setRefreshing(false);
  };

  return (
    <VendorsView
      cardImageHeight={vendorListImageHeight(width, space.screen)}
      title={vendorsTitle(category)}
      count={resultCount(results, ["professional", "professionals"])}
      categories={VENDOR_CATEGORY_OPTIONS}
      category={category}
      onChangeCategory={(key) => update({ category: key })}
      search={search}
      onChangeSearch={setSearch}
      // As on Home: enquiries when signed in, otherwise log in and come back to them.
      chat={{
        label: signedIn ? "My enquiries" : "Messages, log in to see them",
        dot: signedIn && hasUnread(enquiries.data),
        onPress: () =>
          signedIn ? router.navigate("/user/enquiries" as Href) : router.push({ pathname: "/user/login", params: { from: "/user/enquiries" } }),
      }}
      nearControl={<NearMeButton />}
      // A city filters too; without one, the radius decides what counts as near (listed first, or the only ones on a price sort).
      radiusOptions={nearPoint && location === ALL_KERALA ? RADIUS_OPTIONS : null}
      radius={String(radiusKm)}
      onChangeRadius={(km) => setRadiusKm(Number(km) as NearbyRadiusKm)}
      cityLabel={nearestFirst ? `${locationLabel(location)}, nearest first` : locationLabel(location)}
      priceOptions={PRICE_RANGES}
      price={price}
      onChangePrice={(value) => setPrice(value as PriceRange)}
      sortOptions={nearPoint ? SORT_OPTIONS.map((o) => (o.value === "recommended" ? { ...o, label: "Nearest first" } : o)) : SORT_OPTIONS}
      sort={sort}
      onChangeSort={(value) => setSort(value as CatalogSort)}
      results={toResultsView(results)}
      onRetry={() => void results.refetch()}
      empty={empty}
      onEmptyAction={() => {
        if (empty.action.type === "radius") setRadiusKm(empty.action.km);
        else if (empty.action.type === "browse-by-city") setNearPoint(null);
        else reset();
      }}
      hasMore={results.hasNextPage}
      loadingMore={results.isFetchingNextPage}
      onLoadMore={() => void results.fetchNextPage()}
      refreshing={refreshing}
      onRefresh={() => void refresh()}
      onOpenListing={(card) => router.push(card.to as Href)}
      renderFavourite={(card) => <FavouriteButton id={card.slug} label={card.name} />}
    />
  );
}
