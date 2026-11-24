import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "./text";
import { colors, radius, size, space } from "./tokens";

export interface BottomTabItem {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Unread or pending count; 0 hides it. */
  badge?: number;
}

interface BottomTabBarProps {
  items: BottomTabItem[];
  activeKey: string;
  onPress: (key: string) => void;
  /** Long press on a tab (React Navigation's tabLongPress event). */
  onLongPress?: (key: string) => void;
}

/** The app's bottom tabs from the home design: black outline icons, the open tab pink (icon on a light pink fill, so inner lines stay visible) with a pink bar under its label. */
export function BottomTabBar({ items, activeKey, onPress, onLongPress }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }]} accessibilityRole="tablist">
      {items.map(({ key, label, icon: Icon, badge = 0 }) => {
        const active = key === activeKey;
        const tint = active ? colors.brand : colors.ink;
        return (
          <Pressable
            key={key}
            onPress={() => onPress(key)}
            onLongPress={onLongPress && (() => onLongPress(key))}
            accessibilityRole="tab"
            accessibilityLabel={badge > 0 ? `${label}, ${badge} new` : label}
            accessibilityState={{ selected: active }}
            style={styles.item}
          >
            <View>
              <Icon size={24} color={tint} fill={active ? colors.tintPink : "none"} strokeWidth={active ? 2 : 1.75} />
              {badge > 0 && <View style={styles.badge} />}
            </View>
            <AppText variant="caption" color={active ? "brand" : "ink"} numberOfLines={1}>
              {label}
            </AppText>
            <View style={[styles.indicator, active && styles.indicatorActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.sm,
  },
  item: { flex: 1, minHeight: size.tabBar - space.sm, alignItems: "center", justifyContent: "flex-start", gap: space.xs },
  indicator: { width: 44, height: 3, borderRadius: radius.full, backgroundColor: "transparent" },
  indicatorActive: { backgroundColor: colors.brand },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 9,
    height: 9,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
