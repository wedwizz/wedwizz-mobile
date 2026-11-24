import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadow, space } from "./tokens";

interface CardProps {
  children: ReactNode;
  /** Makes the whole card a button. */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Inner padding; 0 for cards that start with a photo. Default 16. */
  padding?: number;
  /** "plain" white card with border and shadow (web CARD); "tint" the pink strip (stats, address row). */
  tone?: "plain" | "tint";
  /** Size and position of the card (width, margins, flex). */
  style?: StyleProp<ViewStyle>;
}

// The shadow is on the outer view and the clipping (photos to the rounded corners) on the inner one: clipping a view hides its own shadow on iOS.
export function Card({ children, onPress, accessibilityLabel, padding = space.lg, tone = "plain", style }: CardProps) {
  const inner = <View style={[styles.inner, { padding }]}>{children}</View>;
  const outer = [styles.outer, tone === "tint" ? styles.tint : styles.plain, style];
  if (!onPress) return <View style={outer}>{inner}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [outer, pressed && styles.pressed]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: radius.lg },
  inner: { borderRadius: radius.lg, overflow: "hidden" },
  plain: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, boxShadow: shadow.card },
  tint: { backgroundColor: colors.tintPink },
  pressed: { opacity: 0.85 },
});
