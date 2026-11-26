import { Pressable, StyleSheet, View } from "react-native";
import { ArrowRight, type LucideIcon } from "lucide-react-native";
import { SafeImage } from "./safe-image";
import { AppText } from "./text";
import { colors, fonts, radius, shadow, space, type ColorToken } from "./tokens";

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

/** The planner card colours (planner reference 2026-11-26): a soft gradient, a dark title, a bright arrow. */
// Bright, deep enough at the bottom for the white title; `ink` is the pill text, `accent` the arrow.
const PLANNER_TONES = {
  pink: { from: "#fa86b6", to: "#e2306f", ink: "#8a1240", accent: "#e8196b" },
  lavender: { from: "#c8a2f5", to: "#8e4fdc", ink: "#3b1d78", accent: "#8b46e0" },
  peach: { from: "#fdb24f", to: "#ec6612", ink: "#8a2a0a", accent: "#ea6a12" },
  teal: { from: "#62dcd4", to: "#0f9a9c", ink: "#0b3c44", accent: "#0e8a94" },
} as const;

export type PlannerTone = keyof typeof PLANNER_TONES;

interface PlannerCardProps {
  label: string;
  /** The 3D picture (bundled, transparent PNG); null shows the icon instead. */
  image: number | null;
  icon: LucideIcon;
  /** The live line in the pill ("3 saved", "Create now"). */
  detail: string;
  tone: PlannerTone;
  onPress: () => void;
}

/** Home's "Your Wedding Planner" card (planner reference 2026-11-26): bright gradient, 3D picture, white title, pill, arrow. */
export function PlannerCard({ label, image, icon: Icon, detail, tone, onPress }: PlannerCardProps) {
  const t = PLANNER_TONES[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${detail}`}
      style={({ pressed }) => [
        styles.planner,
        { backgroundImage: `linear-gradient(160deg, ${t.from} 0%, ${t.to} 100%)`, backgroundColor: t.to, boxShadow: `0 6px 16px ${t.to}59` },
        pressed && styles.pressed,
      ]}
    >
      {/* A soft light across the top of the card. */}
      <View style={styles.plannerWave} pointerEvents="none" />
      {image !== null ? (
        <SafeImage source={image} alt="" contentFit="contain" style={styles.plannerImage} />
      ) : (
        <View style={styles.plannerIcon}>
          <Icon size={30} color={t.accent} strokeWidth={1.9} />
        </View>
      )}
      <AppText variant="cardTitle" numberOfLines={2} style={styles.plannerTitle}>
        {label}
      </AppText>
      <View style={styles.plannerFoot}>
        <View style={styles.plannerPill}>
          <AppText variant="caption" numberOfLines={2} style={{ color: t.ink }}>
            {detail}
          </AppText>
        </View>
        <View style={styles.plannerArrow}>
          <ArrowRight size={18} color={t.accent} strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  planner: {
    flex: 1,
    minHeight: 160,
    padding: space.md,
    paddingTop: space.sm,
    gap: space.sm,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
  },
  plannerWave: {
    position: "absolute",
    top: "-50%",
    left: "-30%",
    width: "160%",
    height: "95%",
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  // Shorter than wide, so the card stays compact; the picture keeps its size across the card.
  plannerImage: { alignSelf: "stretch", height: 72 },
  plannerIcon: {
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    boxShadow: shadow.card,
  },
  plannerTitle: {
    fontFamily: fonts.displayHeavy,
    fontSize: 18,
    lineHeight: 22,
    marginTop: "auto",
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.22)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  plannerFoot: { flexDirection: "row", alignItems: "center", gap: space.xs + 2 },
  plannerPill: {
    flexShrink: 1,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs + 1,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  plannerArrow: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    boxShadow: shadow.raised,
  },
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
