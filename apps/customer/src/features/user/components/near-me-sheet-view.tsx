import { StyleSheet, View } from "react-native";
import { LocateFixed, Settings } from "lucide-react-native";
import { AppText, Button, OptionList, Sheet, colors, radius, space, type SelectOption } from "@wedwizz/ui";

interface NearMeSheetViewProps {
  visible: boolean;
  onClose: () => void;
  /** Before asking: the explainer. After a failure: the note and the city picker (web nearMeFallback). */
  fallbackNote: string | null;
  explainer: string;
  asking: boolean;
  onAllow: () => void;
  /** Location was refused: a button to the app's settings. */
  showOpenSettings: boolean;
  onOpenSettings: () => void;
  /** Finding the position timed out: "Try again". */
  showRetry: boolean;
  cities: SelectOption<string>[];
  city: string;
  onChooseCity: (city: string) => void;
}

/** Web NearMeSheet: explains why, then the phone asks for the position; if it can't be used, the city picker. */
export function NearMeSheetView({
  visible,
  onClose,
  fallbackNote,
  explainer,
  asking,
  onAllow,
  showOpenSettings,
  onOpenSettings,
  showRetry,
  cities,
  city,
  onChooseCity,
}: NearMeSheetViewProps) {
  return (
    <Sheet visible={visible} title={fallbackNote ? "Choose your city" : "Find vendors near you"} onClose={onClose}>
      {fallbackNote === null ? (
        <View style={styles.ask}>
          <AppText variant="body">{explainer}</AppText>
          <AppText variant="meta" color="muted">
            Your phone will ask for permission next.
          </AppText>
          <Button label={asking ? "Finding you…" : "Use my location"} iconLeft={LocateFixed} loading={asking} onPress={onAllow} fullWidth />
          <Button label="Not now" variant="outline" onPress={onClose} fullWidth />
        </View>
      ) : (
        <View style={styles.fallback}>
          <View style={styles.note} accessibilityLiveRegion="polite">
            <AppText variant="meta">{fallbackNote}</AppText>
          </View>
          {showOpenSettings && <Button label="Open settings" variant="soft" iconLeft={Settings} onPress={onOpenSettings} fullWidth />}
          {showRetry && <Button label="Try again" variant="soft" iconLeft={LocateFixed} loading={asking} onPress={onAllow} fullWidth />}
          <OptionList options={cities} value={city} onSelect={onChooseCity} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  ask: { gap: space.md, paddingBottom: space.sm },
  fallback: { gap: space.md, flexShrink: 1 },
  note: { backgroundColor: colors.soft, borderRadius: radius.md, paddingHorizontal: space.md + 2, paddingVertical: space.md },
});
