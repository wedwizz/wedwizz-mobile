import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Skeleton } from "./states";
import { colors, radius, space } from "./tokens";

/** A row of cards that scrolls sideways, starting at the screen's side padding (home rails). */
export function Rail({ children, accessibilityLabel }: { children: ReactNode; accessibilityLabel?: string }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}
      decelerationRate="fast"
    >
      {children}
    </ScrollView>
  );
}

/** Grey cards in a rail while it loads (web RAIL_SKELETON). */
export function RailSkeleton({ cardWidth, imageHeight = 130, count = 3 }: { cardWidth: number; imageHeight?: number; count?: number }) {
  return (
    <View style={styles.skeletonRow} accessible accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.skeletonCard, { width: cardWidth }]}>
          <Skeleton height={imageHeight} />
          <View style={styles.skeletonLines}>
            <Skeleton width="75%" height={14} round />
            <Skeleton width="50%" height={12} round />
            <Skeleton width="40%" height={14} round />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.md, paddingHorizontal: space.screen, paddingVertical: space.xs },
  skeletonRow: { flexDirection: "row", gap: space.md, paddingHorizontal: space.screen, overflow: "hidden" },
  skeletonCard: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  skeletonLines: { padding: space.md, gap: space.sm },
});
