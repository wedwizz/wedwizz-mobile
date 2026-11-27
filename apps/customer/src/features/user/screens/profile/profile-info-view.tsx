import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import { AppText, Card, EmptyState, IconButton, InlineLink, Screen, colors, space } from "@wedwizz/ui";
import { FAQS, LEGAL } from "@/features/user/lib/info-content";

// Notification preferences are left out until notifications exist, as on the web: its switches weren't saved anywhere.
export const PROFILE_SECTION_TITLES: Record<string, string> = {
  help: "Help & support",
  privacy: "Privacy policy",
  terms: "Terms & conditions",
};

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
    </View>
  );
}

export interface ProfileInfoViewProps {
  section: string | undefined;
  /** "Profile" on the web; "Back" when the page was opened from the sign-in screens. */
  backLabel: string;
  onBack: () => void;
  /** Help's "Still stuck? Email …" address (EXPO_PUBLIC_SUPPORT_EMAIL); null hides the line. */
  supportEmail: string | null;
  onEmailSupport: () => void;
}

/** Web profile-info-page.tsx: help, privacy or terms. */
export function ProfileInfoView({ section, backLabel, onBack, supportEmail, onEmailSupport }: ProfileInfoViewProps) {
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
          {section === "help" && (
            <View style={styles.paragraphs}>
              {FAQS.map((f) => (
                <Faq key={f.q} q={f.q} a={f.a} />
              ))}
              {supportEmail && (
                <AppText variant="meta" color="muted">
                  Still stuck? Email <InlineLink label={supportEmail} color="brand" onPress={onEmailSupport} />.
                </AppText>
              )}
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
  faq: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg },
  answer: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  grow: { flex: 1 },
});
