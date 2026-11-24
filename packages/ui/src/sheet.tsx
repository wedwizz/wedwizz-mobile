import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronDown, X } from "lucide-react-native";
import { IconButton } from "./icon-button";
import { FieldLabel } from "./field-label";
import { AppText } from "./text";
import { colors, radius, size, space } from "./tokens";

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Scrolls the content: forms taller than the sheet (edit profile, add task, review). */
  scroll?: boolean;
}

/** Panel that slides up from the bottom over a dim backdrop. Closes on the backdrop, the X, and Android's back button. */
export function Sheet({ visible, title, onClose, children, scroll = false }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, space.lg) }]} accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="subheading" accessibilityRole="header" style={styles.title}>
              {title}
            </AppText>
            <IconButton icon={X} label="Close" onPress={onClose} />
          </View>
          {scroll ? (
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface OptionSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: SelectOption<T>[];
  value: T | "";
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** A sheet listing choices, the chosen one ticked (the phone's version of a web <select>). Picking one closes it. */
export function OptionSheet<T extends string>({ visible, title, options, value, onSelect, onClose }: OptionSheetProps<T>) {
  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <OptionList
        options={options}
        value={value}
        onSelect={(next) => {
          onSelect(next);
          onClose();
        }}
      />
    </Sheet>
  );
}

interface OptionListProps<T extends string> {
  options: SelectOption<T>[];
  value: T | "";
  onSelect: (value: T) => void;
}

/** The ticked list inside OptionSheet, for sheets that show more than the list (the Near me fallback). */
export function OptionList<T extends string>({ options, value, onSelect }: OptionListProps<T>) {
  return (
    <ScrollView style={styles.list}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <AppText variant={selected ? "bodyStrong" : "body"} color={selected ? "brand" : "ink"} style={styles.optionLabel}>
              {option.label}
            </AppText>
            {selected && <Check size={20} color={colors.brand} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  /** "optional" or similar, after the label. */
  note?: string;
  required?: boolean;
  options: SelectOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  /** Shown while nothing is chosen (web's first <option>, e.g. "Select city", "Not sure yet"). */
  placeholder: string;
  error?: string;
}

/** A field that opens an OptionSheet: the form version of a web <select>. Looks like TextField. */
export function SelectField<T extends string>({ label, note, required, options, value, onChange, placeholder, error }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.value === value);
  return (
    <View style={styles.field}>
      <FieldLabel label={label} note={note} required={required} />
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${chosen?.label ?? placeholder}`}
        accessibilityHint="Opens a list to choose from"
        style={[styles.box, { borderColor: error ? colors.danger : colors.lineStrong }]}
      >
        <AppText variant="lead" color={chosen ? "ink" : "muted"} numberOfLines={1} style={styles.optionLabel}>
          {chosen?.label ?? placeholder}
        </AppText>
        <ChevronDown size={20} color={colors.muted} />
      </Pressable>
      {error && (
        <AppText variant="meta" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      <OptionSheet visible={open} title={label} options={options} value={value} onSelect={onChange} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  panel: {
    maxHeight: "80%",
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl,
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: radius.full, backgroundColor: colors.lineStrong, marginTop: space.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: space.sm },
  title: { flex: 1 },
  list: { flexGrow: 0 },
  option: { flexDirection: "row", alignItems: "center", minHeight: 52, gap: space.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  optionLabel: { flex: 1 },
  pressed: { opacity: 0.6 },
  field: { gap: space.xs + 2 },
  box: {
    minHeight: size.control,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
});
