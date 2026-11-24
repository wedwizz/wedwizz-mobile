import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { Button } from "./button";
import { EmptyState, ErrorState, LoadingState } from "./states";
import { AppText } from "./text";
import { colors, space } from "./tokens";

export interface ResultsEmpty {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

interface ResultsListProps<T> {
  /** Title, filters and search, above the results (scrolls with them). */
  header: ReactElement;
  /** Pinned above the list, outside the scroll (e.g. the Vendors search and chat): stays put while the list scrolls. */
  topBar?: ReactElement | null;
  state: "loading" | "error" | "empty" | "items";
  items: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactElement;
  /** 1 for full-width cards, 2 for a grid. */
  columns?: 1 | 2;
  onRetry: () => void;
  empty: ResultsEmpty;
  /** More pages: loaded when the end comes into view. */
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreFailed: boolean;
  onLoadMore: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  /** Under the results (and under the empty state), e.g. Shortlisted's "No longer available" box. */
  extraFooter?: ReactElement | null;
}

/**
 * A search's results page (web ListingResults): loading cards, the error page with "Try again", the empty state with
 * its action, or the cards. More load on their own near the end; a failed page shows "Couldn't load more" with a retry.
 */
export function ResultsList<T>({
  header,
  state,
  items,
  keyOf,
  renderItem,
  columns = 1,
  onRetry,
  empty,
  hasMore,
  loadingMore,
  loadMoreFailed,
  onLoadMore,
  refreshing,
  onRefresh,
  extraFooter = null,
  topBar = null,
}: ResultsListProps<T>) {
  const body =
    state === "loading" ? (
      <LoadingState cards={6} />
    ) : state === "error" ? (
      <ErrorState onRetry={onRetry} />
    ) : state === "empty" ? (
      <EmptyState icon={empty.icon} title={empty.title} body={empty.body} actionLabel={empty.actionLabel} onAction={empty.onAction} />
    ) : null;

  const footer =
    state !== "items" || !hasMore ? null : (
      <View style={styles.footer}>
        {loadingMore ? (
          <ActivityIndicator color={colors.brand} accessibilityLabel="Loading more" />
        ) : loadMoreFailed ? (
          <>
            <AppText variant="meta" color="danger" accessibilityRole="alert">
              Couldn't load more. Try again.
            </AppText>
            <Button label="Load more" variant="outline" size="sm" onPress={onLoadMore} />
          </>
        ) : null}
      </View>
    );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {topBar && <View style={styles.topBar}>{topBar}</View>}
      <FlatList
        key={columns}
        data={state === "items" ? items : []}
        keyExtractor={keyOf}
        renderItem={({ item }) => <View style={columns === 2 ? styles.half : undefined}>{renderItem(item)}</View>}
        numColumns={columns}
        columnWrapperStyle={columns === 2 ? styles.columns : undefined}
        ListHeaderComponent={header}
        ListEmptyComponent={body ?? undefined}
        ListFooterComponent={
          footer || extraFooter ? (
            <>
              {footer}
              {extraFooter}
            </>
          ) : undefined
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (state === "items" && hasMore && !loadingMore && !loadMoreFailed) onLoadMore();
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.screen, paddingBottom: space.xxxl, gap: space.lg },
  // White behind it, so the list scrolls out of sight under it.
  topBar: { paddingHorizontal: space.screen, paddingTop: space.sm, paddingBottom: space.sm, backgroundColor: colors.white },
  columns: { gap: space.md },
  // Half the row each, so a last card on its own keeps its size.
  half: { flex: 1, maxWidth: "50%" },
  footer: { alignItems: "center", gap: space.sm, paddingVertical: space.lg },
});
