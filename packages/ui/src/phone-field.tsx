import { forwardRef } from "react";
import { Pressable, StyleSheet, View, type TextInputInstance } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { AppText } from "./text";
import { TextField, type TextFieldProps } from "./text-field";
import { colors, space } from "./tokens";

interface PhoneFieldProps extends Omit<TextFieldProps, "leading" | "keyboardType"> {
  /** Dial code shown before the number, e.g. "+91". */
  dialCode: string;
  /** Flag emoji for the dial code, e.g. "🇮🇳". */
  flag?: string;
  /** Opens the country choice (the web's Country select). Without it the code is not a button. */
  onPressCountry?: () => void;
}

/** The login design's phone field: flag, dial code and arrow, a divider, then the number. */
export const PhoneField = forwardRef<TextInputInstance, PhoneFieldProps>(function PhoneField(
  { dialCode, flag, onPressCountry, ...props },
  ref,
) {
  const country = (
    <View style={styles.country}>
      {flag && <AppText variant="lead">{flag}</AppText>}
      <AppText variant="lead">{dialCode}</AppText>
      {onPressCountry && <ChevronDown size={18} color={colors.ink} />}
    </View>
  );
  return (
    <TextField
      ref={ref}
      {...props}
      keyboardType="phone-pad"
      textContentType="telephoneNumber"
      // The national number only (web autoComplete="tel-national"): a "+91…" suggestion would be cut to the wrong digits.
      autoComplete="tel-national"
      leading={
        <View style={styles.leading}>
          {onPressCountry ? (
            <Pressable onPress={onPressCountry} accessibilityRole="button" accessibilityLabel={`Country code ${dialCode}, change`} hitSlop={8}>
              {country}
            </Pressable>
          ) : (
            country
          )}
          <View style={styles.divider} />
        </View>
      }
    />
  );
});

const styles = StyleSheet.create({
  leading: { flexDirection: "row", alignItems: "center", gap: space.md },
  country: { flexDirection: "row", alignItems: "center", gap: space.sm },
  divider: { width: 1.5, height: 28, backgroundColor: colors.lineStrong },
});
