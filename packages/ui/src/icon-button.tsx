import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "./text";
import { colors, radius, shadow, size } from "./tokens";

export type IconButtonVariant = "plain" | "surface" | "overlay" | "brandOutline" | "whatsapp" | "brand";

interface IconButtonProps {
  icon: LucideIcon;
  /** What the button does, read by screen readers ("Back", "Messages", "Call"). */
  label: string;
  onPress?: () => void;
  /**
   * plain: icon only (header icons on white). surface: white circle with a shadow (on cards and photos).
   * overlay: dark see-through circle (arrows on the hero photo). brandOutline: the call button.
   * whatsapp: green circle. brand: pink circle.
   */
  variant?: IconButtonVariant;
  /** Unread count on the icon (chat). 0 hides it. */
  badge?: number;
  /** A small dot instead of a count. */
  dot?: boolean;
  diameter?: number;
  /** "circle" (default), or "rounded": a rounded rectangle, to sit beside Home-style search boxes. */
  shape?: "circle" | "rounded";
  /** Icon colour; each variant has its own default. */
  color?: string;
  /** Fills the icon (a saved heart). */
  filled?: boolean;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

const look: Record<IconButtonVariant, { bg: string; icon: string; border?: string; shadow?: string }> = {
  plain: { bg: "transparent", icon: colors.ink },
  surface: { bg: colors.white, icon: colors.ink, shadow: shadow.card },
  overlay: { bg: colors.scrim, icon: colors.white },
  brandOutline: { bg: colors.white, icon: colors.brand, border: colors.brand },
  whatsapp: { bg: colors.whatsapp, icon: colors.white },
  brand: { bg: colors.brand, icon: colors.white },
};

export function IconButton({
  icon: Icon,
  label,
  onPress,
  variant = "plain",
  badge = 0,
  dot = false,
  diameter = size.iconButton,
  shape = "circle",
  color,
  filled = false,
  disabled = false,
  selected,
  style,
}: IconButtonProps) {
  const v = look[variant];
  const iconColor = color ?? v.icon;
  const iconSize = Math.round(diameter * 0.5);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={badge > 0 ? `${label}, ${badge} unread` : label}
      accessibilityState={{ disabled, selected }}
      hitSlop={diameter < size.iconButton ? (size.iconButton - diameter) / 2 : undefined}
      style={({ pressed }) => [
        styles.base,
        { width: diameter, height: diameter, backgroundColor: v.bg },
        shape === "rounded" && styles.rounded,
        v.border !== undefined && { borderColor: v.border, borderWidth: 1.5 },
        v.shadow !== undefined && { boxShadow: v.shadow },
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon size={iconSize} color={iconColor} fill={filled ? iconColor : "none"} />
      {badge > 0 ? (
        <View style={styles.badge}>
          <AppText variant="caption" color="white" style={styles.badgeText}>
            {badge > 99 ? "99+" : badge}
          </AppText>
        </View>
      ) : (
        dot && <View style={styles.dot} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  rounded: { borderRadius: radius.md },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
  badge: {
    position: "absolute",
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
