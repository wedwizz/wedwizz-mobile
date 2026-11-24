import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { LocateFixed, Settings } from "lucide-react-native";
import { AppText, Button, ListRow, OptionList, SearchField, Sheet, colors, radius, space } from "@wedwizz/ui";
import { useNearMe } from "@/features/user/hooks/use-near-me";
import { ALL_KERALA, filterCities } from "@/features/user/lib/location";
import { nearMeFallback } from "@/features/user/lib/near-me";
import { useUserStore } from "@/features/user/store/user-store";

interface CitySheetViewProps {
  visible: boolean;
  onClose: () => void;
  search: string;
  onChangeSearch: (text: string) => void;
  /** Cities matching the search (filterCities). */
  cities: string[];
  /** The chosen city, or "" while "near me" is on. */
  city: string;
  onChooseCity: (city: string) => void;
  /** "Near me" is on (results sorted by distance). */
  nearOn: boolean;
  asking: boolean;
  onUseLocation: () => void;
  /** Why the location couldn't be used (nearMeFallback); null when it could or wasn't asked. */
  problem: string | null;
  showOpenSettings: boolean;
  onOpenSettings: () => void;
}

/** The location picker: "Use my current location", a search box, then the matching cities. */
export function CitySheetView(props: CitySheetViewProps) {
  const detail = props.asking ? "Finding you…" : props.nearOn ? "On: vendors sorted by distance from you" : "Find vendors closest to you";
  return (
    <Sheet visible={props.visible} title="Choose your location" onClose={props.onClose}>
      <View style={styles.body}>
        <ListRow label="Use my current location" detail={detail} icon={LocateFixed} tone="tint" onPress={props.asking ? undefined : props.onUseLocation} chevron={false} />
        {props.problem && (
          <View style={styles.note} accessibilityLiveRegion="polite">
            <AppText variant="meta">{props.problem}</AppText>
            {props.showOpenSettings && <Button label="Open settings" variant="soft" size="sm" iconLeft={Settings} onPress={props.onOpenSettings} />}
          </View>
        )}
        {/* In a row: the box stretches sideways; in the column it would be squeezed flat by the list below. */}
        <View style={styles.searchRow}>
          <SearchField value={props.search} onChangeText={props.onChangeSearch} placeholder="Search city" accessibilityLabel="Search cities" look="outlined" />
        </View>
        {props.cities.length > 0 ? (
          <OptionList options={props.cities.map((c) => ({ value: c, label: c }))} value={props.city} onSelect={props.onChooseCity} />
        ) : (
          <AppText variant="meta" color="muted" align="center" style={styles.none}>
            No city matches “{props.search.trim()}”.
          </AppText>
        )}
      </View>
    </Sheet>
  );
}

/**
 * The location picker wired to the store (Home's city pill). A city and "near me" are one choice here: picking a city
 * stops sorting by distance; using the current location searches all of Kerala by distance.
 */
export function CitySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const location = useUserStore((s) => s.location);
  const setLocation = useUserStore((s) => s.setLocation);
  const nearMe = useNearMe();
  const [search, setSearch] = useState("");
  const fallback = nearMeFallback(nearMe.status);

  const close = () => {
    setSearch("");
    nearMe.resetStatus();
    onClose();
  };

  return (
    <CitySheetView
      visible={visible}
      onClose={close}
      search={search}
      onChangeSearch={setSearch}
      cities={filterCities(search)}
      city={nearMe.point ? "" : location}
      onChooseCity={(city) => {
        nearMe.clear();
        setLocation(city);
        close();
      }}
      nearOn={!!nearMe.point}
      asking={nearMe.status === "asking"}
      onUseLocation={() => {
        void nearMe.request().then((ok) => {
          if (!ok) return;
          setLocation(ALL_KERALA);
          close();
        });
      }}
      problem={fallback.note}
      showOpenSettings={nearMe.status === "denied"}
      onOpenSettings={() => void Linking.openSettings()}
    />
  );
}

const styles = StyleSheet.create({
  body: { gap: space.md, flexShrink: 1 },
  note: { gap: space.sm, backgroundColor: colors.soft, borderRadius: radius.md, paddingHorizontal: space.md + 2, paddingVertical: space.md },
  none: { paddingVertical: space.lg },
  searchRow: { flexDirection: "row" },
});
