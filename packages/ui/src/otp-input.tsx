import { useRef, useState } from "react";
import { StyleSheet, TextInput, View, type TextInputInstance } from "react-native";
import { enterOtpText, otpBackspaceFocus } from "./otp";
import { colors, radius, size, space, type } from "./tokens";

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  /** Focus the first box when the screen opens. */
  autoFocus?: boolean;
  /** Red borders (wrong code). */
  invalid?: boolean;
}

/** Six code boxes from the Verify OTP design; behaviour from the web's OtpInput. The first box accepts the SMS code autofill. */
export function OtpInput({ length = 6, value, onChange, autoFocus = false, invalid = false }: OtpInputProps) {
  const refs = useRef<(TextInputInstance | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);

  const onChangeText = (index: number, raw: string) => {
    const next = enterOtpText(value, index, raw, length);
    onChange(next.value);
    if (next.focus !== null) refs.current[next.focus]?.focus();
  };

  return (
    <View style={styles.row} accessibilityRole="none" accessibilityLabel="One-time password">
      {Array.from({ length }, (_, i) => {
        const active = focused === i;
        const filled = Boolean(value[i]);
        const borderColor = invalid ? colors.danger : active || filled ? colors.brand : colors.lineStrong;
        return (
          <TextInput
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={value[i] ?? ""}
            onChangeText={(raw) => onChangeText(i, raw)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key !== "Backspace") return;
              const prev = otpBackspaceFocus(value, i);
              if (prev !== null) refs.current[prev]?.focus();
            }}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused((f) => (f === i ? null : f))}
            autoFocus={autoFocus && i === 0}
            keyboardType="number-pad"
            // The OS offers the code from the SMS in the first box; other boxes would offer it again.
            textContentType={i === 0 ? "oneTimeCode" : "none"}
            autoComplete={i === 0 ? "sms-otp" : "off"}
            // Room for a pasted or autofilled code; the helper keeps one digit per box.
            maxLength={i === 0 ? length : 2}
            selectTextOnFocus
            cursorColor={colors.brand}
            selectionColor={colors.brand}
            accessibilityLabel={`Digit ${i + 1}`}
            style={[styles.box, { borderColor }, active && styles.active]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: space.sm },
  box: {
    flex: 1,
    maxWidth: size.otpBox,
    height: size.otpBox + 4,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    textAlign: "center",
    ...type.heading,
    color: colors.ink,
    padding: 0,
  },
  active: { backgroundColor: colors.soft },
});
