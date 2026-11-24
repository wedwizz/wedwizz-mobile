import { StyleSheet, View } from "react-native";
import { ArrowRight, Phone } from "lucide-react-native";
import { AppText, AuthLayout, Button, InlineLink, OtpInput, colors, radius, space } from "@wedwizz/ui";
import { LOGO } from "./auth-assets";

export interface VerifyOtpViewProps {
  /** e.g. "+91 98•••••210". */
  maskedPhone: string;
  otp: string[];
  onChangeOtp: (otp: string[]) => void;
  error: string;
  notice: string;
  canVerify: boolean;
  verifying: boolean;
  onVerify: () => void;
  /** Seconds until a new code can be sent; 0 shows "Resend OTP". */
  resendSeconds: number;
  resending: boolean;
  onResend: () => void;
  onChangePhone: () => void;
  onBack: () => void;
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Web verify-otp-page.tsx (the code step), styled from design/customer/verify otp.png. */
export function VerifyOtpView(props: VerifyOtpViewProps) {
  return (
    <AuthLayout logo={LOGO} onBack={props.onBack}>
      <AppText variant="title" align="center" accessibilityRole="header">
        Verify your number
      </AppText>
      <AppText variant="lead" color="muted" align="center" style={styles.subtitle}>
        Enter the 6-digit code sent to
      </AppText>
      <View style={styles.phoneChip}>
        <Phone size={18} color={colors.ink} fill={colors.ink} />
        <AppText variant="bodyStrong" accessibilityLabel={`Code sent to ${props.maskedPhone}`}>
          {props.maskedPhone}
        </AppText>
        <InlineLink label="Edit" color="brand" accessibilityLabel="Change phone number" onPress={props.onChangePhone} />
      </View>

      <OtpInput value={props.otp} onChange={props.onChangeOtp} invalid={props.error !== ""} autoFocus />
      <View style={styles.message} accessibilityLiveRegion="polite">
        {props.error !== "" && (
          <AppText variant="label" color="danger" align="center">
            {props.error}
          </AppText>
        )}
        {props.notice !== "" && props.error === "" && (
          <AppText variant="meta" color="ok" align="center">
            {props.notice}
          </AppText>
        )}
      </View>

      <View style={styles.resend}>
        {props.resendSeconds > 0 ? (
          <AppText variant="body" color="muted" align="center">
            Resend code in{" "}
            <AppText variant="bodyStrong" color="brand">
              {clock(props.resendSeconds)}
            </AppText>
          </AppText>
        ) : (
          <Button label={props.resending ? "Sending..." : "Resend OTP"} variant="link" disabled={props.resending} onPress={props.onResend} />
        )}
      </View>

      <Button
        label={props.verifying ? "Verifying..." : "Verify & continue"}
        iconRight={props.verifying ? undefined : ArrowRight}
        disabled={!props.canVerify || props.verifying}
        onPress={props.onVerify}
        fullWidth
      />
    </AuthLayout>
  );
}


const styles = StyleSheet.create({
  subtitle: { marginTop: space.sm },
  phoneChip: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.md,
    marginBottom: space.xxl,
    paddingHorizontal: space.xl,
    paddingVertical: space.sm + 2,
    borderRadius: radius.full,
    backgroundColor: colors.tintPink,
  },
  message: { minHeight: 28, justifyContent: "center", marginTop: space.md },
  resend: { alignItems: "center", marginTop: space.sm, marginBottom: space.xxl },
});
