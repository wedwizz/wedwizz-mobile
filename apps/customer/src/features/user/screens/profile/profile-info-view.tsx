import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import { AppText, Card, Divider, EmptyState, IconButton, Screen, ToggleSwitch, colors, space } from "@wedwizz/ui";

// Content from web profile-info-page.tsx (sample texts, to be replaced before launch, as on the web).
const PREFS = [
  { key: "enquiries", label: "Enquiry replies", hint: "When a vendor responds" },
  { key: "offers", label: "Market offers", hint: "New sample deals and packages" },
  { key: "reminders", label: "Checklist reminders", hint: "Upcoming planning tasks" },
  { key: "news", label: "Tips & inspiration", hint: "Occasional wedding ideas" },
] as const;

const FAQS = [
  { q: "How do I contact a vendor?", a: "Open any venue or vendor and tap Send Enquiry. Your details are shared only for that enquiry (demo)." },
  { q: "Is booking available in the app?", a: "Not yet. This demo lets you send enquiries; bookings shown are sample data." },
  { q: "How do I change my city?", a: "Tap the location at the top of the home screen, or edit your profile." },
];

const LEGAL = {
  privacy: ["This is a sample privacy policy for demonstration.", "We would collect only what is needed to show you relevant vendors and handle your enquiries.", "Replace this text with your real policy before launch."],
  terms: ["These are sample terms and conditions for demonstration.", "Listings, prices and availability in this demo are not real.", "Replace this text with your real terms before launch."],
};

export const PROFILE_SECTION_TITLES: Record<string, string> = {
  notifications: "Notification preferences",
  help: "Help & support",
  privacy: "Privacy policy",
  terms: "Terms & conditions",
};

function NotificationPrefs() {
  // Not saved anywhere yet, as on the web.
  const [values, setValues] = useState<Record<string, boolean>>({ enquiries: true, offers: true, reminders: true, news: false });
  return (
    <Card padding={0}>
      {PREFS.map((p, i) => (
        <View key={p.key}>
          {i > 0 && <Divider />}
          <View style={styles.pref}>
            <View style={styles.grow}>
              <AppText variant="bodyStrong">{p.label}</AppText>
              <AppText variant="meta" color="muted">
                {p.hint}
              </AppText>
            </View>
            <ToggleSwitch label={p.label} checked={values[p.key]} onChange={(c) => setValues((v) => ({ ...v, [p.key]: c }))} />
          </View>
        </View>
      ))}
    </Card>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card padding={0}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.faq}>
        <AppText variant="bodyStrong" style={styles.grow}>
          {q}
        </AppText>
        {open ? <ChevronUp size={20} color={colors.muted} /> : <ChevronDown size={20} color={colors.muted} />}
      </Pressable>
      {open && (
        <AppText variant="body" color="muted" style={styles.answer}>
          {a}
        </AppText>
      )}
    </Card>
  );
}

/** When a vendor gets the customer's phone number: only by the customer's own action, per vendor. */
function ContactSharingPolicy() {
  return (
    <View style={styles.paragraphs}>
      <AppText variant="subheading" accessibilityRole="header">
        Sharing your contact details
      </AppText>
      <AppText variant="body">Vendors you message see your name and the wedding details you send, but not your phone number.</AppText>
      <AppText variant="body">A vendor gets your number only when you choose to share it in that chat, or when you contact them by WhatsApp or phone.</AppText>
      <AppText variant="meta" color="muted">
        Sample text: replace it with your real policy before launch.
      </AppText>
    </View>
  );
}

export interface ProfileInfoViewProps {
  section: string | undefined;
  /** "Profile" on the web; "Back" when the page was opened from the sign-in screens. */
  backLabel: string;
  onBack: () => void;
}

/** Web profile-info-page.tsx: notifications, help, privacy or terms. */
export function ProfileInfoView({ section, backLabel, onBack }: ProfileInfoViewProps) {
  const title = section ? PROFILE_SECTION_TITLES[section] : undefined;
  return (
    <Screen>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label={backLabel} onPress={onBack} />
        <AppText variant="label" color="muted">
          {backLabel}
        </AppText>
      </View>
      {!title ? (
        <EmptyState title="Page not found" body="That settings page doesn't exist." />
      ) : (
        <View style={styles.body}>
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          {section === "notifications" && <NotificationPrefs />}
          {section === "help" && (
            <View style={styles.paragraphs}>
              {FAQS.map((f) => (
                <Faq key={f.q} q={f.q} a={f.a} />
              ))}
              <AppText variant="meta" color="muted">
                Still stuck? Email support@example.com (sample address).
              </AppText>
            </View>
          )}
          {(section === "privacy" || section === "terms") && (
            <View style={styles.paragraphs}>
              {LEGAL[section].map((p) => (
                <AppText key={p} variant="body">
                  {p}
                </AppText>
              ))}
            </View>
          )}
          {section === "privacy" && <ContactSharingPolicy />}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: space.xs, marginLeft: -space.md, marginBottom: space.sm },
  body: { gap: space.lg },
  paragraphs: { gap: space.md },
  pref: { flexDirection: "row", alignItems: "center", gap: space.lg, padding: space.lg },
  faq: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg },
  answer: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  grow: { flex: 1 },
});
