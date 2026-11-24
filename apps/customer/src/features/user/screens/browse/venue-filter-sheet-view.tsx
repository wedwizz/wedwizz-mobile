import { StyleSheet, View } from "react-native";
import { AppText, Button, ChipGroup, Sheet, space, type SelectOption } from "@wedwizz/ui";

interface VenueFilterSheetViewProps {
  visible: boolean;
  onClose: () => void;
  priceOptions: SelectOption<string>[];
  price: string;
  onChangePrice: (value: string) => void;
  capacityOptions: SelectOption<string>[];
  capacity: string;
  onChangeCapacity: (value: string) => void;
  onClearAll: () => void;
  onShowResults: () => void;
}

/** Web VenueFilterDrawer without its location (the city is chosen on Home): hall rent and capacity (apply on "Show results"). */
export function VenueFilterSheetView(props: VenueFilterSheetViewProps) {
  return (
    <Sheet visible={props.visible} title="Filters" onClose={props.onClose}>
      <View style={styles.body}>
        <View style={styles.group}>
          <AppText variant="bodyStrong" accessibilityRole="header">
            Hall rent per day
          </AppText>
          <ChipGroup accessibilityLabel="Hall rent per day" options={props.priceOptions} value={props.price} onChange={props.onChangePrice} />
        </View>
        <View style={styles.group}>
          <AppText variant="bodyStrong" accessibilityRole="header">
            Guest capacity
          </AppText>
          <ChipGroup accessibilityLabel="Guest capacity" options={props.capacityOptions} value={props.capacity} onChange={props.onChangeCapacity} />
        </View>
        <View style={styles.actions}>
          <Button label="Clear all" variant="outline" onPress={props.onClearAll} style={styles.action} />
          <Button label="Show results" onPress={props.onShowResults} style={styles.action} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.xl, paddingTop: space.sm },
  group: { gap: space.sm },
  actions: { flexDirection: "row", gap: space.md, paddingTop: space.sm },
  action: { flex: 1 },
});
