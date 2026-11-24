import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { IconButton } from "./icon-button";
import { colors, space } from "./tokens";

interface ScreenPlaceholderProps {
  title: string;
  /** Where the real screen comes from, e.g. the web page it will be built from. */
  note?: string;
  /** Shows a back arrow (pages opened on top of the tabs). */
  onBack?: () => void;
}

/** Stands in for a screen until its flow is built. Remove once no screen uses it. */
export function ScreenPlaceholder({ title, note, onBack }: ScreenPlaceholderProps) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {onBack && (
        <View style={styles.top}>
          <IconButton icon={ArrowLeft} label="Back" onPress={onBack} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  top: { paddingHorizontal: space.sm },
  body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: "700", color: colors.ink },
  note: { fontSize: 14, color: colors.muted, textAlign: "center" },
});
