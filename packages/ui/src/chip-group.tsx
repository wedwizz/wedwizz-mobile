import { Pressable, ScrollView, StyleSheet } from "react-native";
import { AppText } from "./text";
import { colors, radius, space } from "./tokens";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** What the chips choose, for screen readers (web aria-label). */
  accessibilityLabel: string;
}

/** Horizontally scrolling single-choice chips: category selectors, status filters (web ChipGroup). */
export function ChipGroup<T extends string>({ options, value, onChange, accessibilityLabel }: ChipGroupProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={styles.row}
      style={styles.scroller}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.chip, active ? styles.active : styles.idle, pressed && styles.pressed]}
          >
            <AppText variant="label" color={active ? "white" : "ink"}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Chips scroll to the screen edges, with the screen's padding inside.
  scroller: { marginHorizontal: -space.screen, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: space.screen },
  chip: { minHeight: 40, justifyContent: "center", paddingHorizontal: space.lg, borderRadius: radius.full, borderWidth: 1.5 },
  active: { backgroundColor: colors.brand, borderColor: colors.brand },
  idle: { backgroundColor: colors.white, borderColor: colors.line },
  pressed: { opacity: 0.8 },
});
