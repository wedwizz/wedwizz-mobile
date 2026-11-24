import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./text";
import { colors, radius, space, type ColorToken } from "./tokens";

/** Progress bar, 0–100 (web ProgressBar: pink track, brand fill). */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

/** On/off switch (web ToggleSwitch). */
export function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      hitSlop={8}
      style={[styles.switch, { backgroundColor: checked ? colors.brand : colors.lineStrong }]}
    >
      <View style={[styles.knob, { left: checked ? 22 : 2 }]} />
    </Pressable>
  );
}

export type PillTone = "brand" | "action" | "waiting" | "ok" | "neutral";

// The web's status chip colours (features/user/lib/styles.ts: ENQUIRY_STATUS_CLASS, BOOKING_TONE_CLASS).
const pillTone: Record<PillTone, { bg: string; text: ColorToken }> = {
  brand: { bg: colors.white, text: "brand" }, // "Wedding Essentials" label on the deals banner
  action: { bg: colors.tintPink, text: "brandDark" },
  waiting: { bg: colors.tintCream, text: "amberText" },
  ok: { bg: colors.tintMint, text: "ok" },
  neutral: { bg: colors.tintSand, text: "muted" },
};

/** Small rounded label: enquiry and booking statuses, "Verified", "Wedding Essentials". */
export function Pill({ label, tone = "action" }: { label: string; tone?: PillTone }) {
  const t = pillTone[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <AppText variant="caption" color={t.text} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

/** Thin line between rows; dashed between package rows in the design. */
export function Divider({ dashed = false }: { dashed?: boolean }) {
  return <View style={[styles.divider, dashed && styles.dashed]} />;
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: radius.full, backgroundColor: colors.tintPink, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.full, backgroundColor: colors.brand },
  switch: { width: 48, height: 28, borderRadius: radius.full, justifyContent: "center" },
  knob: { position: "absolute", width: 24, height: 24, borderRadius: radius.full, backgroundColor: colors.white, boxShadow: "0 1px 3px rgba(0,0,0,0.25)" },
  pill: { alignSelf: "flex-start", paddingHorizontal: space.sm + 2, paddingVertical: space.xs, borderRadius: radius.full },
  divider: { height: 1, backgroundColor: colors.line },
  dashed: { height: 0, borderTopWidth: 1, borderStyle: "dashed", borderColor: colors.lineStrong, backgroundColor: "transparent" },
});
