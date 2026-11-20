import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./tokens";

interface ScreenPlaceholderProps {
  title: string;
  /** Where the real screen comes from, e.g. the web page it will be built from. */
  note?: string;
}

/** Stands in for a screen until its flow is built. Remove once no screen uses it. */
export function ScreenPlaceholder({ title, note }: ScreenPlaceholderProps) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: "700", color: colors.ink },
  note: { fontSize: 14, color: colors.muted, textAlign: "center" },
});
