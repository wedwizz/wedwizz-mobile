import type { ReactElement, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ArrowLeft, Heart } from "lucide-react-native";
import { AppText, Button, Card, ChipGroup, Divider, IconButton, ResultsList, space } from "@wedwizz/ui";
import type { ShortlistTab } from "./shortlist";

export interface FavouritesViewProps {
  onBack: () => void;
  /** "Your saved venues and vendors." (and market items, when the market is shown). */
  subtitle: string;
  tabs: { value: ShortlistTab; label: string }[];
  tab: ShortlistTab;
  onChangeTab: (tab: ShortlistTab) => void;
  state: "loading" | "error" | "empty" | "items";
  onRetry: () => void;
  /** Each saved item's card (venue, vendor or market), with its key. */
  cards: { key: string; node: ReactNode }[];
  /** 1 for venues and vendors (as their browse pages), 2 for market items. */
  columns: 1 | 2;
  emptyActionLabel: string;
  onExplore: () => void;
  /** Saved listings no longer public (GoneRowView each), on the venues and vendors tabs. */
  gone: ReactElement[];
  refreshing: boolean;
  onRefresh: () => void;
}

/** Web favourites-page.tsx: title, the three tabs with counts, one card per row (market: two), and "No longer available". */
export function FavouritesView(props: FavouritesViewProps) {
  const header = (
    <View style={styles.header}>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label="Go back" onPress={props.onBack} />
      </View>
      <View>
        <AppText variant="title" accessibilityRole="header">
          Shortlisted
        </AppText>
        <AppText variant="meta" color="muted">
          {props.subtitle}
        </AppText>
      </View>
      <ChipGroup accessibilityLabel="Saved item type" options={props.tabs} value={props.tab} onChange={props.onChangeTab} />
    </View>
  );

  const gone =
    props.gone.length > 0 ? (
      <Card style={styles.gone}>
        <AppText variant="cardTitle" accessibilityRole="header">
          No longer available
        </AppText>
        <AppText variant="meta" color="muted" style={styles.goneBody}>
          These businesses are not listed on WedWizz right now.
        </AppText>
        {props.gone}
      </Card>
    ) : null;

  return (
    <ResultsList
      header={header}
      state={props.state}
      items={props.cards}
      keyOf={(card) => card.key}
      renderItem={(card) => <>{card.node}</>}
      columns={props.columns}
      onRetry={props.onRetry}
      empty={{ icon: Heart, title: "Nothing saved yet", body: "Tap the heart on anything you like and it will show up here.", actionLabel: props.emptyActionLabel, onAction: props.onExplore }}
      hasMore={false}
      loadingMore={false}
      loadMoreFailed={false}
      onLoadMore={() => undefined}
      refreshing={props.refreshing}
      onRefresh={props.onRefresh}
      extraFooter={gone}
    />
  );
}

/** One "No longer available" row: its name (the slug, as the web) and Remove. */
export function GoneRowView({ slug, onRemove, removing, error }: { slug: string; onRemove: () => void; removing: boolean; error: string }) {
  return (
    <View>
      <Divider />
      <View style={styles.goneRow}>
        <AppText variant="body" numberOfLines={1} style={styles.flex}>
          {slug}
        </AppText>
        <Button label="Remove" variant="outline" size="sm" loading={removing} onPress={onRemove} />
      </View>
      {error !== "" && (
        <AppText variant="meta" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingBottom: space.xs },
  back: { marginLeft: -space.sm, paddingTop: space.xs },
  flex: { flex: 1 },
  gone: { marginTop: space.md },
  goneBody: { marginBottom: space.xs },
  goneRow: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.sm },
});
