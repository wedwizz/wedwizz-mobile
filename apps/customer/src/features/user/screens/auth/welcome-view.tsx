import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Button, InlineLink, Logo, SafeImage, colors, space } from "@wedwizz/ui";
import { LOGO } from "./auth-assets";
import { LegalLinks } from "./legal-links";

export interface WelcomeViewProps {
  /** Bundled photo (require). */
  heroImage: number;
  onGetStarted: () => void;
  onHaveAccount: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  /** The vendor login on the website; the link is hidden when there is none. */
  onVendorLogin?: () => void;
}

/** Web welcome-page.tsx: full-screen photo, dark fade, logo, title, two buttons, legal text, vendor link. */
export function WelcomeView({ heroImage, onGetStarted, onHaveAccount, onTerms, onPrivacy, onVendorLogin }: WelcomeViewProps) {
  return (
    <View style={styles.screen}>
      <SafeImage source={heroImage} alt="A flower-decked wedding mandap at sunset" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.fade]} />
      <SafeAreaView style={styles.content} edges={["top", "bottom"]}>
        <View style={styles.logo}>
          <Logo source={LOGO} light />
        </View>
        <View style={styles.bottom}>
          <AppText variant="hero" color="white" accessibilityRole="header">
            Everything You Need for Your Perfect Wedding
          </AppText>
          <AppText variant="body" color="white" style={styles.lead}>
            Discover venues, photographers, makeup artists and more across Kerala. Plan, shortlist and enquire, all in one place.
          </AppText>
          <Button label="Get Started" onPress={onGetStarted} fullWidth style={styles.primary} />
          <Button label="I already have an account" variant="onDark" onPress={onHaveAccount} fullWidth style={styles.secondary} />
          <View style={styles.legal}>
            <LegalLinks light onTerms={onTerms} onPrivacy={onPrivacy} />
          </View>
          {onVendorLogin && (
            <AppText variant="meta" color="white" align="center">
              Are you a vendor? <InlineLink label="Log in here" color="white" onPress={onVendorLogin} />
            </AppText>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  // Web: bg-gradient-to-t from-black/85 via-black/35 to-black/10.
  fade: { backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.35), rgba(0,0,0,0.1))" },
  content: { flex: 1, paddingHorizontal: space.xxl },
  logo: { paddingTop: space.xxl },
  bottom: { marginTop: "auto", paddingBottom: space.lg },
  lead: { marginTop: space.md, opacity: 0.85 },
  primary: { marginTop: space.xxl + space.xs },
  secondary: { marginTop: space.md },
  legal: { marginTop: space.xl, marginBottom: space.lg, opacity: 0.9 },
});
