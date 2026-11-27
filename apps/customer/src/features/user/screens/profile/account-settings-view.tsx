import { StyleSheet, View } from "react-native";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react-native";
import { AppText, Card, Divider, IconButton, ListRow, Screen, space } from "@wedwizz/ui";

export interface AccountSettingsViewProps {
  backLabel: string;
  onBack: () => void;
  /** "+91 98765 43210", or "—". */
  phone: string;
  onLogout: () => void;
  loggingOut: boolean;
  onDeleteAccount: () => void;
}

/** Web account-settings-page.tsx (Profile → Account settings): the signed-in number, Log out, Delete account. */
export function AccountSettingsView(p: AccountSettingsViewProps) {
  return (
    <Screen>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label={p.backLabel} onPress={p.onBack} />
        <AppText variant="label" color="muted">
          {p.backLabel}
        </AppText>
      </View>
      <View style={styles.body}>
        <AppText variant="title" accessibilityRole="header">
          Account settings
        </AppText>
        <Card>
          <AppText variant="caption" color="muted">
            Signed in with
          </AppText>
          <AppText variant="bodyStrong">{p.phone}</AppText>
        </Card>
        <Card padding={0}>
          <View style={styles.menu}>
            <ListRow icon={LogOut} label={p.loggingOut ? "Logging out…" : "Log out"} chevron={false} onPress={p.loggingOut ? undefined : p.onLogout} />
            <Divider />
            <ListRow icon={Trash2} label="Delete account" tone="danger" onPress={p.onDeleteAccount} />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: space.xs, marginLeft: -space.md, marginBottom: space.sm },
  body: { gap: space.lg },
  menu: { paddingHorizontal: space.lg },
});
