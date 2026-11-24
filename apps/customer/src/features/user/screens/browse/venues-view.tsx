import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Building2, SlidersHorizontal } from "lucide-react-native";
import { AppText, ChatBoxButton, IconButton, ResultsList, SearchField, SelectPill, space, type SelectOption } from "@wedwizz/ui";
import { VenueCard } from "@/features/user/components/listing-cards";
import type { ListingCardView, ResultsView } from "@/features/user/lib/catalog-view";

export interface VenuesViewProps {
  count: string | null;
  /** The city chosen on Home ("Kerala" for all), shown after the count. Only Home changes it. */
  cityLabel: string;
  search: string;
  onChangeSearch: (text: string) => void;
  /** The message button beside the search box (as on Home): its label, the unread dot, and where it goes. */
  chat: { label: string; dot: boolean; onPress: () => void };
  activeFilters: number;
  onOpenFilters: () => void;
  sortOptions: SelectOption<string>[];
  sort: string;
  onChangeSort: (sort: string) => void;
  results: ResultsView;
  onRetry: () => void;
  onClearAll: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenListing: (card: ListingCardView) => void;
  renderFavourite: (card: ListingCardView) => ReactNode;
  /** The card photo height (lib/card-sizes.ts). */
  cardImageHeight: number;
  /** The filter sheet, rendered by the screen. */
  sheet: ReactNode;
}

/** Web venues-page.tsx: search, filters and chat pinned on top (as Home), then title and count (in the city chosen on Home), sort, then the venues one under another. */
export function VenuesView(props: VenuesViewProps) {
  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.shrink}>
          <AppText variant="title" accessibilityRole="header">
            Wedding Venues
          </AppText>
          <AppText variant="meta" color="muted" style={styles.count} accessibilityLiveRegion="polite">
            {props.count ? `${props.count} in ${props.cityLabel}` : ""}
          </AppText>
        </View>
      </View>
      <View style={styles.sortRow}>
        <AppText variant="meta" color="muted">
          Sort by
        </AppText>
        <SelectPill label="Sort by" options={props.sortOptions} value={props.sort} onChange={props.onChangeSort} />
      </View>
      {props.sheet}
    </View>
  );

  const r = props.results;
  return (
    <ResultsList
      // Search, filters and chat stay at the top while the list scrolls under them.
      topBar={
        <View style={styles.searchRow}>
          <SearchField value={props.search} onChangeText={props.onChangeSearch} placeholder="Search venues or towns" accessibilityLabel="Search venues" look="home" />
          <IconButton
            icon={SlidersHorizontal}
            label={props.activeFilters > 0 ? `Open filters, ${props.activeFilters} on` : "Open filters"}
            variant="brandOutline"
            shape="rounded"
            diameter={52}
            badge={props.activeFilters}
            onPress={props.onOpenFilters}
          />
          <ChatBoxButton {...props.chat} />
        </View>
      }
      header={header}
      state={r.state === "cards" ? "items" : r.state}
      items={r.state === "cards" ? r.cards : []}
      keyOf={(card) => card.slug}
      renderItem={(card) => <VenueCard card={card} imageHeight={props.cardImageHeight} onPress={() => props.onOpenListing(card)} favourite={props.renderFavourite(card)} />}
      onRetry={props.onRetry}
      empty={{ icon: Building2, title: "No venues match", body: "Try removing a filter, or choose another city on Home.", actionLabel: "Clear filters", onAction: props.onClearAll }}
      hasMore={props.hasMore}
      loadingMore={props.loadingMore}
      loadMoreFailed={r.state === "cards" && r.loadMoreFailed}
      onLoadMore={props.onLoadMore}
      refreshing={props.refreshing}
      onRefresh={props.onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingTop: space.sm, paddingBottom: space.xs },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md },
  shrink: { flexShrink: 1 },
  count: { minHeight: 18 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  sortRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
});
