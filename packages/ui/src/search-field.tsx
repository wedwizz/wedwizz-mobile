import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ChevronDown, Search, X } from "lucide-react-native";
import { OptionSheet, type SelectOption } from "./sheet";
import { AppText } from "./text";
import { colors, fonts, radius, shadow, space, type } from "./tokens";

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Read for the box (web aria-label, e.g. "Search venues"). */
  accessibilityLabel: string;
  /** "pill" (default); "home": Home's search box, a white rounded rectangle with a soft shadow; "outlined": a white
   *  rectangle with a grey outline and no shadow (the location picker, reference 2026-11-25). */
  look?: "pill" | "home" | "outlined";
}

/** Search box with a clear button (web SearchBar). */
export function SearchField({ value, onChangeText, placeholder, accessibilityLabel, look = "pill" }: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  const home = look === "home";
  const outlined = look === "outlined";
  const big = home || outlined;
  const border = focused ? colors.brand : home ? colors.line : colors.lineStrong;
  return (
    <View style={[styles.search, home && styles.searchHome, outlined && styles.searchOutlined, { borderColor: border }]}>
      <Search size={big ? 22 : 18} color={big ? colors.ink : colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
      />
      {value !== "" && (
        <Pressable onPress={() => onChangeText("")} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} style={styles.clear}>
          <X size={16} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

interface SelectPillProps<T extends string> {
  /** What is chosen ("Sort", "Location"): the sheet's title and what screen readers say. */
  label: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Stretch to share a row with other pills. */
  grow?: boolean;
}

/** A small rounded select (web SelectInput in filter rows): shows the choice, opens a sheet of options. */
export function SelectPill<T extends string>({ label, options, value, onChange, grow = false }: SelectPillProps<T>) {
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.value === value)?.label ?? "";
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${chosen}`}
        accessibilityHint="Opens a list to choose from"
        style={({ pressed }) => [styles.pill, grow && styles.grow, pressed && styles.pressed]}
      >
        <AppText variant="label" numberOfLines={1} style={styles.pillText}>
          {chosen}
        </AppText>
        <ChevronDown size={16} color={colors.muted} />
      </Pressable>
      <OptionSheet visible={open} title={label} options={options} value={value} onSelect={onChange} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    height: 48,
    paddingLeft: space.lg,
    paddingRight: space.md,
    borderWidth: 1.5,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
  // Same as Home's HomeSearchBar box.
  searchHome: { height: 52, borderWidth: 1, borderRadius: radius.md, boxShadow: shadow.card },
  searchOutlined: { height: 52, borderWidth: 1.5, borderRadius: radius.sm, paddingLeft: space.lg + 2 },
  input: { flex: 1, minWidth: 0, height: 44, padding: 0, color: colors.ink, fontFamily: fonts.regular, fontSize: type.body.fontSize },
  clear: { width: 24, height: 24, borderRadius: radius.full, alignItems: "center", justifyContent: "center", backgroundColor: colors.warm },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.xs,
    minHeight: 40,
    paddingHorizontal: space.md + 2,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
  // Two to a row in a wrapping row; a third takes the next row.
  grow: { flexGrow: 1, flexBasis: "40%", minWidth: 0 },
  pillText: { flexShrink: 1 },
  pressed: { opacity: 0.7 },
});
