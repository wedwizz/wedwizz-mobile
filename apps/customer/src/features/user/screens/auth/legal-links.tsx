import { InlineLink, AppText } from "@wedwizz/ui";

interface LegalLinksProps {
  onTerms: () => void;
  onPrivacy: () => void;
  /** White text, for the welcome photo. */
  light?: boolean;
  /** The web's profile setup words it "Privacy policy" in a sentence; the sign-in screens say "Privacy Policy". */
  privacyLabel?: string;
}

/** "By continuing you agree to our Terms and Privacy Policy." (web LegalLinks). */
export function LegalLinks({ onTerms, onPrivacy, light = false, privacyLabel = "Privacy Policy" }: LegalLinksProps) {
  const color = light ? "white" : "ink";
  return (
    <AppText variant="meta" color={light ? "white" : "muted"} align="center">
      By continuing you agree to our <InlineLink label="Terms" color={color} onPress={onTerms} /> and{" "}
      <InlineLink label={privacyLabel} color={color} onPress={onPrivacy} />.
    </AppText>
  );
}
