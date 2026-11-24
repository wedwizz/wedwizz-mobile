import type { ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { AppText } from "./text";
import { colors, radius, space } from "./tokens";

interface ScreenProps {
  children: ReactNode;
  /** Scrolls the content (most screens). Lists that virtualise (FlatList) pass false. */
  scroll?: boolean;
  /** Side padding of 20; off for edge-to-edge photos. */
  padded?: boolean;
  /** Safe-area edges to pad. Tab screens leave out "bottom" (the tab bar handles it). */
  edges?: Edge[];
  /** Pull to refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Pinned under the content (e.g. the detail page's Message / WhatsApp / Call bar). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** How far the content has scrolled (e.g. Home turns the status bar dark once its photo is gone). */
  onScrollY?: (y: number) => void;
  /** Children that stay pinned at the top once scrolled to (e.g. Home's search bar), by position. */
  stickyHeaderIndices?: number[];
}

/** Every screen's frame: white background, safe areas, optional scrolling and pull to refresh. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ["top"],
  refreshing,
  onRefresh,
  footer,
  contentStyle,
  onScrollY,
  stickyHeaderIndices,
}: ScreenProps) {
  const onScroll = onScrollY ? (e: NativeSyntheticEvent<NativeScrollEvent>) => onScrollY(e.nativeEvent.contentOffset.y) : undefined;
  const pad = padded && styles.padded;
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[pad, styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={stickyHeaderIndices}
          onScroll={onScroll}
          scrollEventThrottle={onScroll ? 64 : undefined}
          refreshControl={
            onRefresh ? <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} /> : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, pad, contentStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

interface ListRowProps {
  label: string;
  /** Second line, muted. */
  detail?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  /** "tint": the pink address row from the vendor design; "plain": profile and settings menus; "danger": Log out. */
  tone?: "plain" | "tint" | "danger";
  /** Hides the arrow (rows that open nothing). */
  chevron?: boolean;
}

/** A row with an icon, text and an arrow: the vendor design's address row, profile menu items. */
export function ListRow({ label, detail, icon: Icon, onPress, tone = "plain", chevron = Boolean(onPress) }: ListRowProps) {
  const body = (
    <>
      {Icon && <Icon size={20} color={tone === "tint" ? colors.brand : tone === "danger" ? colors.danger : colors.ink} />}
      <View style={styles.rowText}>
        <AppText variant="body" color={tone === "danger" ? "danger" : "ink"} numberOfLines={2}>
          {label}
        </AppText>
        {detail && (
          <AppText variant="meta" color="muted" numberOfLines={2}>
            {detail}
          </AppText>
        )}
      </View>
      {chevron && <ChevronRight size={20} color={colors.muted} />}
    </>
  );
  const look = [styles.row, tone === "tint" && styles.rowTint];
  if (!onPress) return <View style={look}>{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [look, pressed && styles.pressed]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  fill: { flex: 1 },
  padded: { paddingHorizontal: space.screen },
  scrollContent: { paddingBottom: space.xxxl },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 52, paddingVertical: space.md },
  rowTint: { backgroundColor: colors.tintPink, borderRadius: radius.md, paddingHorizontal: space.lg },
  rowText: { flex: 1, gap: space.xxs },
  pressed: { opacity: 0.7 },
});
