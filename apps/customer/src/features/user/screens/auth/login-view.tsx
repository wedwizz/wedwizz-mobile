import { useState } from "react";
import { StyleSheet } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { AppText, AuthLayout, Button, OptionSheet, PhoneField, space, type SelectOption } from "@wedwizz/ui";
import { LOGO } from "./auth-assets";
import { LegalLinks } from "./legal-links";

export interface LoginViewProps {
  /** A customer who said "I already have an account". */
  returning: boolean;
  countries: SelectOption<string>[];
  dial: string;
  flag: string;
  onSelectCountry: (dial: string) => void;
  phone: string;
  onChangePhone: (text: string) => void;
  phoneMaxLength: number;
  error: string;
  sending: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
}

/** Web login-page.tsx, styled from design/customer/login page.png. */
export function LoginView(props: LoginViewProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  return (
    <AuthLayout
      logo={LOGO}
      onBack={props.onBack}
      footer={<LegalLinks onTerms={props.onTerms} onPrivacy={props.onPrivacy} />}
    >
      <AppText variant="title" align="center" accessibilityRole="header">
        {props.returning ? "Welcome back" : "Let's get started"}
      </AppText>
      <AppText variant="lead" color="muted" align="center" style={styles.subtitle}>
        Enter your mobile number. We'll send a verification code.
      </AppText>

      <PhoneField
        label="Mobile number"
        dialCode={props.dial}
        flag={props.flag}
        onPressCountry={() => setCountryOpen(true)}
        value={props.phone}
        onChangeText={props.onChangePhone}
        maxLength={props.phoneMaxLength}
        placeholder="98765 43210"
        error={props.error || undefined}
        returnKeyType="send"
        onSubmitEditing={props.onSubmit}
        autoFocus
      />
      <Button
        label={props.sending ? "Sending OTP..." : "Continue"}
        iconRight={props.sending ? undefined : ArrowRight}
        disabled={props.sending}
        onPress={props.onSubmit}
        fullWidth
        style={styles.button}
      />
      <AppText variant="meta" color="muted" align="center" style={styles.note}>
        We only use your number to verify your account and share updates you ask for.
      </AppText>

      <OptionSheet
        visible={countryOpen}
        title="Country"
        options={props.countries}
        value={props.dial}
        onSelect={props.onSelectCountry}
        onClose={() => setCountryOpen(false)}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: space.sm, marginBottom: space.xxl + space.xs },
  button: { marginTop: space.xl },
  note: { marginTop: space.lg },
});

