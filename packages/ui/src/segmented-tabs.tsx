import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./text";
import { colors, space } from "./tokens";
import type { ChipOption } from "./chip-group";

interface SegmentedTabsProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Tabs inside a page (the vendor detail design's Gallery / Packages / About / Reviews): brand text and underline on the open tab. */
export function SegmentedTabs<T extends string>({ options, value, onChange }: SegmentedTabsProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tab}
          >
            <AppText variant={active ? "bodyStrong" : "body"} color={active ? "brand" : "muted"} numberOfLines={1}>
              {option.label}
            </AppText>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { flex: 1, alignItems: "center", paddingTop: space.md, gap: space.md - 2 },
  underline: { alignSelf: "stretch", height: 3, borderRadius: 2, marginBottom: -1, backgroundColor: "transparent" },
  underlineActive: { backgroundColor: colors.brand },
});
