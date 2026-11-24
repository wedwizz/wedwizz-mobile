import type { ReactNode } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, StyleSheet, View, type ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { IconButton } from "./icon-button";
import { AppText } from "./text";
import { colors, radius, space } from "./tokens";

interface AuthLayoutProps {
  children: ReactNode;
  /** The app's logo (the app owns the image file). */
  logo: ImageSourcePropType;
  /** Shows the back arrow (web AuthScreen backTo). */
  onBack?: () => void;
  /** Pinned at the bottom of the scrolling content (legal text, vendor link). */
  footer?: ReactNode;
}

/**
 * Frame of the sign-in screens (web AuthScreen): back arrow, the logo block from the login design, then the content in one
 * column. Scrolls, and moves up with the keyboard.
 */
export function AuthLayout({ children, logo, onBack, footer }: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.fill} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>{onBack ? <IconButton icon={ArrowLeft} label="Back" onPress={onBack} /> : <View style={styles.backSpace} />}</View>
          <Logo source={logo} />
          <View style={styles.body}>{children}</View>
          {footer && <View style={styles.footer}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** The logo block from the login design: mark, "WedWizz" in wine and pink, "WEDDING PLANNER" spaced out. */
export function Logo({ source, light = false }: { source: ImageSourcePropType; light?: boolean }) {
  return (
    <View style={styles.logo} accessible accessibilityRole="image" accessibilityLabel="WedWizz, wedding planner">
      <Image source={source} style={styles.mark} />
      <AppText variant="title" style={styles.wordmark}>
        <AppText variant="title" color={light ? "white" : "brandWine"} style={styles.wordmark}>
          Wed
        </AppText>
        <AppText variant="title" color={light ? "white" : "brand"} style={styles.wordmark}>
          Wizz
        </AppText>
      </AppText>
      <AppText variant="caption" color={light ? "white" : "brandWine"} style={styles.tagline}>
        WEDDING PLANNER
      </AppText>
    </View>
  );
}

/** Full-screen spinner while the session is restored, so signed-in content never flashes (web SessionLoading). */
export function FullScreenLoader() {
  return (
    <View style={styles.loader} accessible accessibilityRole="progressbar" accessibilityLabel="Loading">
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: space.xxl, paddingBottom: space.xxl },
  top: { height: 52, justifyContent: "center", marginLeft: -space.sm },
  backSpace: { height: 44 },
  logo: { alignItems: "center", gap: space.xxs, marginBottom: space.xxl },
  mark: { width: 76, height: 76, borderRadius: radius.lg, marginBottom: space.sm },
  wordmark: { fontSize: 32, lineHeight: 38 },
  tagline: { letterSpacing: 4 },
  body: { flex: 1 },
  footer: { paddingTop: space.xxl },
  loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
});
