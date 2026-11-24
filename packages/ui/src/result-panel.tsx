import { StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "./text";
import { colors, radius, space } from "./tokens";

interface ResultPanelProps {
  icon: LucideIcon;
  title: string;
  body: string;
  /** "ok": green on mint (done, verified). "brand": pink on pink. */
  tone?: "ok" | "brand";
}

/** A finished step: big icon in a circle, title and text, centred (web "Number verified"). The screen adds its button. */
export function ResultPanel({ icon: Icon, title, body, tone = "ok" }: ResultPanelProps) {
  const ok = tone === "ok";
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={[styles.circle, { backgroundColor: ok ? colors.tintMint : colors.tintPink }]}>
        <Icon size={40} color={ok ? colors.ok : colors.brand} />
      </View>
      <AppText variant="title" align="center" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="body" color="muted" align="center" style={styles.body}>
        {body}
      </AppText>
    </View>
  );
}

/** Tappable words inside a sentence (Terms, Privacy Policy, Edit): underlined, and read as a link. */
export function InlineLink({
  label,
  onPress,
  color = "ink",
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  color?: "ink" | "brand" | "white";
  /** Read instead of the label when the word alone is unclear ("Edit" → "Change phone number"). */
  accessibilityLabel?: string;
}) {
  return (
    <AppText variant="label" color={color} onPress={onPress} accessibilityRole="link" accessibilityLabel={accessibilityLabel} suppressHighlighting={false} style={styles.link}>
      {label}
    </AppText>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: space.sm },
  circle: { width: 80, height: 80, borderRadius: radius.full, alignItems: "center", justifyContent: "center", marginBottom: space.md },
  body: { maxWidth: 300 },
  link: { textDecorationLine: "underline" },
});
