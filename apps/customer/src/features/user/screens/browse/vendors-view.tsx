import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Users } from "lucide-react-native";
import { AppText, ChatBoxButton, ChipGroup, ResultsList, SearchField, SelectPill, space, type SelectOption } from "@wedwizz/ui";
import { VendorCard } from "@/features/user/components/listing-cards";
import type { ListingCardView, ResultsView } from "@/features/user/lib/catalog-view";
import type { VendorEmpty } from "./browse-logic";

export interface VendorsViewProps {
  /** Photo height of the full-width cards (lib/card-sizes.ts). */
  cardImageHeight: number;
  title: string;
  count: string | null;
  categories: SelectOption<string>[];
  category: string;
  onChangeCategory: (key: string) => void;
  search: string;
  onChangeSearch: (text: string) => void;
  /** The message button beside the search box (as on Home): its label, the unread dot, and where it goes. */
  chat: { label: string; dot: boolean; onPress: () => void };
  /** "Near me" / "Near you ✕" (wired by the app). */
  nearControl: ReactNode;
  /** Distance chips: only near the customer with no city chosen. */
  radiusOptions: SelectOption<string>[] | null;
  radius: string;
  onChangeRadius: (km: string) => void;
  /** The city chosen on Home ("Kerala" for all), shown after the count. Only Home changes it. */
  cityLabel: string;
  priceOptions: SelectOption<string>[];
  price: string;
  onChangePrice: (value: string) => void;
  sortOptions: SelectOption<string>[];
  sort: string;
  onChangeSort: (value: string) => void;
  results: ResultsView;
  onRetry: () => void;
  empty: VendorEmpty;
  onEmptyAction: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenListing: (card: ListingCardView) => void;
  renderFavourite: (card: ListingCardView) => ReactNode;
}

/** Web vendors-page.tsx: search and chat pinned on top (as Home), then title and count, category chips, Near me (+ distance), price / sort (the city is chosen on Home), a grid of two. */
export function VendorsView(props: VendorsViewProps) {
  const header = (
    <View style={styles.header}>
      <View>
        <AppText variant="title" accessibilityRole="header">
          {props.title}
        </AppText>
        <AppText variant="meta" color="muted" style={styles.count} accessibilityLiveRegion="polite">
          {props.count ? `${props.count} in ${props.cityLabel}` : ""}
        </AppText>
      </View>
      <ChipGroup accessibilityLabel="Vendor category" options={props.categories} value={props.category} onChange={props.onChangeCategory} />
      <View style={styles.row}>{props.nearControl}</View>
      {props.radiusOptions && <ChipGroup accessibilityLabel="Distance" options={props.radiusOptions} value={props.radius} onChange={props.onChangeRadius} />}
      <View style={styles.selects}>
        <SelectPill label="Price range" options={props.priceOptions} value={props.price} onChange={props.onChangePrice} grow />
        <SelectPill label="Sort" options={props.sortOptions} value={props.sort} onChange={props.onChangeSort} grow />
      </View>
    </View>
  );

  const r = props.results;
  return (
    <ResultsList
      // Search and chat stay at the top while the list scrolls under them.
      topBar={
        <View style={styles.row}>
          <SearchField value={props.search} onChangeText={props.onChangeSearch} placeholder="Search by name or city" accessibilityLabel="Search vendors" look="home" />
          <ChatBoxButton {...props.chat} />
        </View>
      }
      header={header}
      state={r.state === "cards" ? "items" : r.state}
      items={r.state === "cards" ? r.cards : []}
      keyOf={(card) => card.slug}
      columns={1}
      renderItem={(card) => <VendorCard card={card} imageHeight={props.cardImageHeight} onPress={() => props.onOpenListing(card)} favourite={props.renderFavourite(card)} />}
      onRetry={props.onRetry}
      empty={{ icon: Users, title: props.empty.title, body: props.empty.body, actionLabel: props.empty.actionLabel, onAction: props.onEmptyAction }}
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
  count: { minHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  selects: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
});
