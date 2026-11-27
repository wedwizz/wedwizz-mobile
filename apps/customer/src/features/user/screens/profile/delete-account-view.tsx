import { StyleSheet, View } from "react-native";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import { AppText, Button, Card, IconButton, Notice, Screen, space } from "@wedwizz/ui";

export interface DeleteAccountViewProps {
  backLabel: string;
  onBack: () => void;
  /** Upcoming bookings that deleting cancels (upcomingBookingsWarning); null when there are none. */
  bookingsWarning: string | null;
  deleting: boolean;
  onDelete: () => void;
}

const DELETED = [
  "Your profile: name, phone number, email and wedding details",
  "Your saved venues and vendors",
  "Your wedding checklist",
  "Your sign-ins on every device",
];

const KEPT = [
  "Your conversations and past bookings stay with the businesses you contacted, shown as “Customer”, without your name or phone number.",
  "Your reviews stay on the listings, without your name.",
];

/** Profile → Delete account (store rule: customers can delete their account in the app). Web delete-account-page.tsx. */
export function DeleteAccountView(p: DeleteAccountViewProps) {
  return (
    <Screen>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label={p.backLabel} onPress={p.onBack} />
        <AppText variant="label" color="muted">
          {p.backLabel}
        </AppText>
      </View>
      <View style={styles.body}>
        <View style={styles.intro}>
          <AppText variant="title" accessibilityRole="header">
            Delete account
          </AppText>
          <AppText variant="lead" color="muted">
            This permanently deletes your WedWizz account. It can’t be undone.
          </AppText>
        </View>

        <Card>
          <View style={styles.list}>
            <AppText variant="cardTitle">What gets deleted</AppText>
            {DELETED.map((line) => (
              <AppText key={line} variant="body">
                {`•  ${line}`}
              </AppText>
            ))}
          </View>
        </Card>

        <Card>
          <View style={styles.list}>
            <AppText variant="cardTitle">What the vendors keep</AppText>
            {KEPT.map((line) => (
              <AppText key={line} variant="body">
                {`•  ${line}`}
              </AppText>
            ))}
          </View>
        </Card>

        {/* Notice lays its content out in a View: the text needs its own AppText. */}
        {p.bookingsWarning && (
          <Notice>
            <AppText variant="meta">{p.bookingsWarning}</AppText>
          </Notice>
        )}

        <AppText variant="meta" color="muted">
          You can sign up again later with the same phone number, as a new account. Nothing from this account comes back.
        </AppText>

        <Button label="Delete my account" variant="danger" iconLeft={Trash2} onPress={p.onDelete} loading={p.deleting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: space.xs, marginLeft: -space.md, marginBottom: space.sm },
  body: { gap: space.lg, paddingBottom: space.xl },
  intro: { gap: space.xs },
  list: { gap: space.sm },
});
