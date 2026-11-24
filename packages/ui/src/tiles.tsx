import { Pressable, StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { SafeImage } from "./safe-image";
import { AppText } from "./text";
import { colors, radius, space, type ColorToken } from "./tokens";

interface CategoryTileProps {
  label: string;
  /** The category picture: a bundled image (require) or a URL (home design). */
  image?: number | string | null;
  /** Without a picture: this icon in a tinted circle (web home categories). */
  icon?: LucideIcon;
  tint?: ColorToken;
  iconColor?: ColorToken;
  onPress: () => void;
  selected?: boolean;
}

/** Home's category row: a picture (or an icon in a tinted circle) with its name underneath. */
export function CategoryTile({ label, image = null, icon: Icon, tint = "tintPink", iconColor = "brandDark", onPress, selected = false }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.category, pressed && styles.pressed]}
    >
      {Icon && image === null ? (
        <View style={[styles.categoryCircle, { backgroundColor: colors[tint] }]}>
          <Icon size={28} color={colors[iconColor]} strokeWidth={1.8} />
        </View>
      ) : (
        <SafeImage source={image} alt="" contentFit="contain" style={styles.categoryImage} />
      )}
      <AppText variant="label" color={selected ? "brand" : "ink"} numberOfLines={2} align="center">
        {label}
      </AppText>
    </Pressable>
  );
}

interface ToolTileProps {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  /** Live count under the label ("3 saved"), as the web's planner tiles. */
  detail?: string;
}

/** Home's "Planning Tools" tile: pink tint, brand line icon, label. */
export function ToolTile({ label, icon: Icon, onPress, detail }: ToolTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      style={({ pressed }) => [styles.tool, pressed && styles.pressed]}
    >
      <Icon size={28} color={colors.brand} strokeWidth={1.75} />
      <View style={styles.toolText}>
        <AppText variant="label" align="center" numberOfLines={2}>
          {label}
        </AppText>
        {detail && (
          <AppText variant="caption" color="brandDark" align="center" numberOfLines={2}>
            {detail}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  category: { width: 80, alignItems: "center", gap: space.xs + 2 },
  categoryImage: { width: 64, height: 60 },
  categoryCircle: { width: 68, height: 60, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  tool: {
    flex: 1,
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.xs,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.tintPink,
  },
  toolText: { gap: space.xxs, alignItems: "center" },
  pressed: { opacity: 0.75 },
});
