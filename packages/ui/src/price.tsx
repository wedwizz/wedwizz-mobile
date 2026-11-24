import { StyleSheet, View } from "react-native";
import { formatINR } from "@wedwizz/core/format";
import { AppText } from "./text";
import { space } from "./tokens";

interface PriceProps {
  /** Null when the listing has no price: "Price on request" (web cards). */
  amount: number | null;
  /** e.g. "per plate", "per day". */
  unit?: string;
  /** e.g. "From". */
  prefix?: string;
  /** Crossed-out earlier price (market offers). */
  originalAmount?: number;
}

/** Price in rupees (web PriceDisplay); brand colour from the designs. */
export function Price({ amount, unit, prefix, originalAmount }: PriceProps) {
  if (amount === null) {
    return (
      <AppText variant="meta" color="muted">
        Price on request
      </AppText>
    );
  }
  return (
    <View style={styles.row}>
      {prefix && (
        <AppText variant="meta" color="muted">
          {prefix}
        </AppText>
      )}
      <AppText variant="price" color="brand">
        {formatINR(amount)}
      </AppText>
      {originalAmount !== undefined && (
        <AppText variant="meta" color="muted" style={styles.struck}>
          {formatINR(originalAmount)}
        </AppText>
      )}
      {unit && (
        <AppText variant="meta" color="muted">
          {unit}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: space.xs + 2 },
  struck: { textDecorationLine: "line-through" },
});
