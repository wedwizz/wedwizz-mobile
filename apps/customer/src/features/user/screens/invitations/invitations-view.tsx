import { StyleSheet, View } from "react-native";
import { ArrowLeft, CheckCircle2, Expand } from "lucide-react-native";
import { AppText, Button, DateField, IconButton, InvitationCard, InvitationTemplateTile, Rail, Screen, Sheet, TextField, colors, space } from "@wedwizz/ui";
import type { InvitationDetails } from "./invitation-logic";

export interface InvitationsViewProps {
  onBack: () => void;
  templates: { id: string; name: string }[];
  templateId: string;
  onTemplate: (id: string) => void;
  details: InvitationDetails;
  onChange: (key: keyof InvitationDetails, value: string) => void;
  /** The preview's date line. */
  dateLabel: string;
  fullOpen: boolean;
  onFull: () => void;
  onCloseFull: () => void;
  saved: boolean;
  onSave: () => void;
}

/** Web invitations-page.tsx: choose a template, your details, the live preview, Full preview and Save design. */
export function InvitationsView(p: InvitationsViewProps) {
  const card = (
    <InvitationCard
      themeId={p.templateId}
      partnerOne={p.details.partnerOne}
      partnerTwo={p.details.partnerTwo}
      date={p.dateLabel}
      venue={p.details.venue}
      message={p.details.message}
    />
  );
  return (
    <Screen>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label="Go back" onPress={p.onBack} />
      </View>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          Digital Invitations
        </AppText>
        <AppText variant="meta" color="muted">
          Pick a theme, add your details and see it update live.
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="subheading" accessibilityRole="header">
          Choose a template
        </AppText>
        <Rail accessibilityLabel="Templates">
          {p.templates.map((t) => (
            <InvitationTemplateTile key={t.id} themeId={t.id} name={t.name} selected={t.id === p.templateId} onPress={() => p.onTemplate(t.id)} />
          ))}
        </Rail>
      </View>

      <View style={styles.section}>
        <AppText variant="subheading" accessibilityRole="header">
          Your details
        </AppText>
        <View style={styles.pair}>
          <View style={styles.flex}>
            <TextField label="Partner one" value={p.details.partnerOne} onChangeText={(v) => p.onChange("partnerOne", v)} autoCapitalize="words" />
          </View>
          <View style={styles.flex}>
            <TextField label="Partner two" value={p.details.partnerTwo} onChangeText={(v) => p.onChange("partnerTwo", v)} autoCapitalize="words" />
          </View>
        </View>
        <DateField label="Wedding date" value={p.details.date} onChange={(v) => p.onChange("date", v)} />
        <TextField label="Venue" value={p.details.venue} onChangeText={(v) => p.onChange("venue", v)} />
        <TextField label="Message" value={p.details.message} onChangeText={(v) => p.onChange("message", v)} multiline />
      </View>

      <View style={styles.section}>
        <AppText variant="subheading" accessibilityRole="header">
          Preview
        </AppText>
        {card}
        <View style={styles.pair}>
          <Button label="Full preview" variant="neutral" iconLeft={Expand} onPress={p.onFull} style={styles.flex} />
          <Button label="Save design" onPress={p.onSave} style={styles.flex} />
        </View>
        {p.saved && (
          <View style={styles.saved} accessibilityLiveRegion="polite">
            <CheckCircle2 size={16} color={colors.ok} />
            <AppText variant="label" color="ok">
              Saved for this session (demo)
            </AppText>
          </View>
        )}
      </View>

      <Sheet visible={p.fullOpen} title="Invitation full preview" onClose={p.onCloseFull} scroll>
        <View style={styles.full}>{card}</View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { paddingTop: space.sm, marginLeft: -space.sm },
  header: { gap: space.xs, marginBottom: space.xl },
  section: { gap: space.lg, marginBottom: space.xxxl },
  pair: { flexDirection: "row", gap: space.md },
  flex: { flex: 1 },
  saved: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.xs },
  full: { paddingBottom: space.sm },
});
