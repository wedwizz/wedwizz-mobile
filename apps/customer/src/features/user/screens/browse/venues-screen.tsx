import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import type { CatalogSort } from "@wedwizz/core/api/types";
import { DEFAULT_NEARBY_RADIUS_KM } from "@wedwizz/core/geo/geo";
import { space } from "@wedwizz/ui";
import { FavouriteButton } from "@/features/user/components/favourite-button";
import { resultCount, useCatalogSearch } from "@/features/user/hooks/use-catalog";
import { useEnquiries } from "@/features/user/hooks/use-enquiries";
import { useSearchText } from "@/features/user/hooks/use-search-text";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { paramString } from "@/features/user/lib/auth-gate";
import { venueListImageHeight } from "@/features/user/lib/card-sizes";
import {
  DEFAULT_VENUE_FILTERS,
  SORT_OPTIONS,
  countActiveVenueFilters,
  toResultsView,
  venueSearchQuery,
  type VenueFilters,
} from "@/features/user/lib/catalog-view";
import { locationLabel } from "@/features/user/lib/location";
import { useUserStore } from "@/features/user/store/user-store";
import { VENUE_CAPACITY_OPTIONS, VENUE_PRICE_OPTIONS } from "./browse-logic";
import { VenueFilterSheetView } from "./venue-filter-sheet-view";
import { hasUnread } from "../home/home-logic";
import { VenuesView } from "./venues-view";

/** Web venues-page.tsx. The search is the route's `q` param (Home's search sends it). */
export function VenuesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const q = paramString(useLocalSearchParams<{ q?: string }>().q) ?? "";
  const location = useUserStore((s) => s.location);
  const nearPoint = useUserStore((s) => s.nearPoint);
  const signedIn = useUserSession().status === "authenticated";
  const enquiries = useEnquiries();
  const [filters, setFilters] = useState<VenueFilters>(DEFAULT_VENUE_FILTERS);
  const [draft, setDraft] = useState<VenueFilters>(DEFAULT_VENUE_FILTERS);
  const [sort, setSort] = useState<CatalogSort>("recommended");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useSearchText(q, (text) => router.setParams({ q: text || undefined }));

  // Near me on: venues within the nearby radius, nearest first, then all the others ("Nearest first").
  const near = nearPoint ? { point: nearPoint, radiusKm: DEFAULT_NEARBY_RADIUS_KM } : null;
  const results = useCatalogSearch(venueSearchQuery({ q, location, filters, sort, near }));

  const clearAll = () => {
    setFilters(DEFAULT_VENUE_FILTERS);
    setSearch("");
    router.setParams({ q: undefined });
  };

  const refresh = async () => {
    setRefreshing(true);
    await results.refetch().catch(() => undefined);
    setRefreshing(false);
  };

  return (
    <VenuesView
      count={resultCount(results, ["venue", "venues"])}
      cityLabel={nearPoint ? `${locationLabel(location)}, nearest first` : locationLabel(location)}
      search={search}
      onChangeSearch={setSearch}
      // As on Home: enquiries when signed in, otherwise log in and come back to them.
      chat={{
        label: signedIn ? "My enquiries" : "Messages, log in to see them",
        dot: signedIn && hasUnread(enquiries.data),
        onPress: () =>
          signedIn ? router.navigate("/user/enquiries" as Href) : router.push({ pathname: "/user/login", params: { from: "/user/enquiries" } }),
      }}
      activeFilters={countActiveVenueFilters(filters)}
      onOpenFilters={() => {
        // Each opening starts from the applied filters (web: the drawer's body mounts on open).
        setDraft(filters);
        setSheetOpen(true);
      }}
      sortOptions={nearPoint ? SORT_OPTIONS.map((o) => (o.value === "recommended" ? { ...o, label: "Nearest first" } : o)) : SORT_OPTIONS}
      sort={sort}
      onChangeSort={(value) => setSort(value as CatalogSort)}
      results={toResultsView(results)}
      onRetry={() => void results.refetch()}
      onClearAll={clearAll}
      hasMore={results.hasNextPage}
      loadingMore={results.isFetchingNextPage}
      onLoadMore={() => void results.fetchNextPage()}
      refreshing={refreshing}
      onRefresh={() => void refresh()}
      onOpenListing={(card) => router.push(card.to as Href)}
      renderFavourite={(card) => <FavouriteButton id={card.slug} label={card.name} />}
      cardImageHeight={venueListImageHeight(width, space.screen)}
      sheet={
        <VenueFilterSheetView
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          priceOptions={VENUE_PRICE_OPTIONS}
          price={draft.priceMax === null ? "any" : String(draft.priceMax)}
          onChangePrice={(v) => setDraft((d) => ({ ...d, priceMax: v === "any" ? null : Number(v) }))}
          capacityOptions={VENUE_CAPACITY_OPTIONS}
          capacity={String(draft.minCapacity)}
          onChangeCapacity={(v) => setDraft((d) => ({ ...d, minCapacity: Number(v) }))}
          onClearAll={() => setDraft(DEFAULT_VENUE_FILTERS)}
          onShowResults={() => {
            setFilters(draft);
            setSheetOpen(false);
          }}
        />
      }
    />
  );
}
