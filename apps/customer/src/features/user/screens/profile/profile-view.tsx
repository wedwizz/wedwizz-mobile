import { Fragment, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Pencil, type LucideIcon } from "lucide-react-native";
import { AppText, Avatar, Button, Card, CountRow, Divider, InfoGrid, ListRow, Screen, colors, space, type CountItem } from "@wedwizz/ui";

export interface ProfileMenuRow {
  label: string;
  icon: LucideIcon;
  detail?: string;
  onPress: () => void;
}

export interface ProfileViewProps {
  name: string;
  /** "Kochi, Kerala". */
  place: string;
  onEdit: () => void;
  details: { label: string; value: string }[];
  counts: CountItem[];
  menu: ProfileMenuRow[];
  /** The edit sheet. */
  sheet: ReactNode;
}

/** Web profile-page.tsx: the profile card with Edit, Saved / Enquiries / Bookings counts, the menu (Log out and Delete account are in Account settings). */
export function ProfileView(p: ProfileViewProps) {
  return (
    <Screen>
      <View style={styles.body}>
        <Card>
          <View style={styles.top}>
            <Avatar name={p.name} />
            <View style={styles.who}>
              <AppText variant="heading" numberOfLines={1} accessibilityRole="header">
                {p.name}
              </AppText>
              <AppText variant="meta" color="muted">
                {p.place}
              </AppText>
            </View>
            <Button label="Edit" variant="soft" size="sm" iconLeft={Pencil} accessibilityLabel="Edit profile" onPress={p.onEdit} />
          </View>
          <View style={styles.details}>
            <InfoGrid rows={p.details} />
          </View>
        </Card>

        <CountRow items={p.counts} separate />

        <Card padding={0}>
          <View style={styles.menu}>
            {p.menu.map((row, i) => (
              <Fragment key={row.label}>
                {i > 0 && <Divider />}
                <ListRow icon={row.icon} label={row.label} detail={row.detail} onPress={row.onPress} />
              </Fragment>
            ))}
          </View>
        </Card>
      </View>
      {p.sheet}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, paddingTop: space.lg },
  top: { flexDirection: "row", alignItems: "center", gap: space.lg },
  who: { flex: 1, minWidth: 0 },
  details: { marginTop: space.xl, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.line },
  menu: { paddingHorizontal: space.lg },
});
