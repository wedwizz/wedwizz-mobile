import { forwardRef, useState, type ReactNode } from "react";
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from "react-native";
import { FieldLabel } from "./field-label";
import { AppText } from "./text";
import { colors, radius, size, space, type } from "./tokens";

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  /** Shown above the field (web FormField label). The designs' login field has none; then pass accessibilityLabel. */
  label?: string;
  /** Pink * after the label. */
  required?: boolean;
  /** Muted note after the label, e.g. "optional". */
  note?: string;
  /** Shown under the field in red; also turns the border red. */
  error?: string;
  /** Shown under the field when there is no error. */
  hint?: string;
  /** Content before the input, inside the border (an icon, or the phone field's country button). */
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Taller field for several lines (notes, messages). */
  multiline?: boolean;
}

/** Text input styled from the login design: white, grey border that turns brand when focused, 56 pt tall. */
export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, required, note, error, hint, leading, trailing, multiline, onFocus, onBlur, editable = true, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.brand : colors.lineStrong;
  return (
    <View style={styles.wrap}>
      {label && <FieldLabel label={label} note={note} required={required} />}
      <View style={[styles.box, multiline && styles.multiline, { borderColor }, !editable && styles.readOnly]}>
        {leading}
        <TextInput
          ref={ref}
          {...props}
          editable={editable}
          multiline={multiline}
          accessibilityLabel={props.accessibilityLabel ?? label}
          placeholderTextColor={colors.muted}
          selectionColor={colors.brand}
          cursorColor={colors.brand}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {trailing}
      </View>
      {error ? (
        <AppText variant="meta" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : (
        hint && (
          <AppText variant="meta" color="muted">
            {hint}
          </AppText>
        )
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: space.xs + 2 },
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
  multiline: { alignItems: "flex-start", paddingVertical: space.md, minHeight: 112 },
  readOnly: { backgroundColor: colors.warm },
  input: { flex: 1, ...type.lead, color: colors.ink, paddingVertical: 0 },
  inputMultiline: { textAlignVertical: "top", minHeight: 88 },
});
