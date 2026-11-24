import { StyleSheet, View } from "react-native";
import { AppText } from "./text";
import { colors, radius, space } from "./tokens";

/** The first letter of a name on a brand circle (web profile card). */
export function Avatar({ name, diameter = 64 }: { name: string; diameter?: number }) {
  return (
    <View style={[styles.avatar, { width: diameter, height: diameter }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <AppText variant="title" color="white">
        {name.charAt(0).toUpperCase()}
      </AppText>
    </View>
  );
}

/** Label over value, two per row (web profile details <dl>). */
export function InfoGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row.label} style={styles.cell} accessible accessibilityLabel={`${row.label}: ${row.value}`}>
          <AppText variant="caption" color="muted">
            {row.label}
          </AppText>
          <AppText variant="label">{row.value}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: radius.full, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: space.md },
  cell: { width: "50%", paddingRight: space.md, gap: space.xxs },
});
