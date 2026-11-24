import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "./text";
import { colors, radius, size, space, type ColorToken } from "./tokens";

export type ButtonVariant = "primary" | "outline" | "soft" | "neutral" | "onDark" | "link" | "danger" | "wine";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /**
   * primary: brand fill ("Get OTP", "Message"). outline: brand border ("Check Dates", "Enable Location Access").
   * soft: pink tint (web brandSoft). neutral: white with grey border (web brandOutline, "Try again").
   * onDark: white text and border on a photo (welcome's "I already have an account"). link: brand text only ("View all").
   * danger: red fill for the confirm button of something that cannot be undone ("Delete", "Cancel booking").
   * wine: the onboarding designs' deeper fill ("Continue", "Start planning").
   */
  variant?: ButtonVariant;
  size?: "md" | "sm";
  /** Icon after the label (the designs' arrow) or before it. */
  iconRight?: LucideIcon;
  iconLeft?: LucideIcon;
  /** Shows a spinner instead of the label and ignores presses (e.g. while sending the OTP). */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Spoken instead of the label, when the label alone is unclear. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const look: Record<ButtonVariant, { bg: string; border?: string; text: ColorToken }> = {
  primary: { bg: colors.brand, text: "white" },
  outline: { bg: colors.white, border: colors.brand, text: "brand" },
  soft: { bg: colors.tintPink, text: "brandDark" },
  neutral: { bg: colors.white, border: colors.lineStrong, text: "ink" },
  onDark: { bg: "transparent", border: "rgba(255,255,255,0.6)", text: "white" },
  link: { bg: "transparent", text: "brand" },
  danger: { bg: colors.danger, text: "white" },
  wine: { bg: colors.wine, text: "white" },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size: buttonSize = "md",
  iconRight: IconRight,
  iconLeft: IconLeft,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const v = look[variant];
  const small = buttonSize === "sm";
  const inactive = disabled || loading;
  const iconSize = small ? 16 : 20;
  const textColor = colors[v.text];

  let content: ReactNode;
  if (loading) {
    content = <ActivityIndicator color={textColor} />;
  } else {
    content = (
      <>
        {IconLeft && <IconLeft size={iconSize} color={textColor} />}
        <AppText variant={small ? "buttonSmall" : "button"} color={v.text} numberOfLines={1}>
          {label}
        </AppText>
        {IconRight && <IconRight size={iconSize} color={textColor} />}
      </>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      hitSlop={variant === "link" ? 8 : undefined}
      style={({ pressed }) => [
        styles.base,
        variant === "link" ? styles.link : { height: small ? size.controlSmall : size.control, paddingHorizontal: small ? space.lg : space.xxl },
        { backgroundColor: v.bg },
        v.border !== undefined && { borderColor: v.border, borderWidth: 1.5 },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.row}>{content}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  link: { paddingVertical: space.xs },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  fullWidth: { alignSelf: "stretch" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
