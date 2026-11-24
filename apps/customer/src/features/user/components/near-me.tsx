import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { LocateFixed, X } from "lucide-react-native";
import { Button, IconButton, Pill, colors, space } from "@wedwizz/ui";
import { useNearMe } from "@/features/user/hooks/use-near-me";
import { ALL_KERALA, KERALA_CITIES } from "@/features/user/lib/location";
import { NEAR_ME_EXPLAINER, nearMeFallback } from "@/features/user/lib/near-me";
import { useUserStore } from "@/features/user/store/user-store";
import { NearMeSheetView } from "./near-me-sheet-view";

const CITY_OPTIONS = [ALL_KERALA, ...KERALA_CITIES].map((city) => ({ value: city, label: city }));

/**
 * Web NearMeButton: "Near me" opens the sheet (the phone asks for the position only after the customer's tap), or
 * "Near you" with an X to stop sorting by distance. Used on Home (variant "banner": pink on the plum banner) and Vendors.
 */
export function NearMeButton({ variant = "outline" }: { variant?: "outline" | "banner" } = {}) {
  const [open, setOpen] = useState(false);
  const nearMe = useNearMe();
  const location = useUserStore((s) => s.location);
  const setLocation = useUserStore((s) => s.setLocation);
  const fallback = nearMeFallback(nearMe.status);

  const close = () => {
    nearMe.resetStatus();
    setOpen(false);
  };

  if (nearMe.point) {
    return (
      <View style={styles.active}>
        <Pill label="Near you" />
        <IconButton icon={X} label="Stop sorting by distance" variant="surface" diameter={36} color={colors.muted} onPress={nearMe.clear} />
      </View>
    );
  }
  return (
    <>
      <Button label="Near me" variant={variant === "banner" ? "soft" : "outline"} size="sm" iconLeft={LocateFixed} onPress={() => setOpen(true)} />
      <NearMeSheetView
        visible={open}
        onClose={close}
        fallbackNote={fallback.showCityPicker ? fallback.note : null}
        explainer={NEAR_ME_EXPLAINER}
        asking={nearMe.status === "asking"}
        onAllow={() => {
          void nearMe.request().then((ok) => {
            if (ok) close();
          });
        }}
        showOpenSettings={nearMe.status === "denied"}
        onOpenSettings={() => void Linking.openSettings()}
        showRetry={nearMe.status === "timeout"}
        cities={CITY_OPTIONS}
        city={location}
        onChooseCity={(next) => {
          setLocation(next);
          close();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  active: { flexDirection: "row", alignItems: "center", gap: space.sm },
});
