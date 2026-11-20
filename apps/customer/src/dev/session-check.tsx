/**
 * TEMPORARY (step 3): a bare sign-in on the Profile tab, only to check on a phone that the session survives killing
 * the app (log in, kill, reopen: still signed in). Not a design, not the web's flow (no welcome page, profile setup or
 * return path). Delete this file when flow 1 (Auth) builds the real login and verify-OTP screens.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@wedwizz/ui";
import { requestOtp, verifyOtp } from "@wedwizz/core/api/auth.api";
import { toApiError } from "@wedwizz/core/api/api-error";
import { PHONE_NUMBER_PATTERN } from "@wedwizz/core/api/types";
import { useUserSession } from "@/features/user/hooks/use-user-session";

export function SessionCheck() {
  const { status, account, completeSignIn, logout } = useUserSession();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const attempt = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = () =>
    attempt(async () => {
      if (!PHONE_NUMBER_PATTERN.test(phone)) throw new Error("Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.");
      await requestOtp({ phoneNumber: phone, role: "USER" });
      setOtpSent(true);
    });

  const verify = () =>
    attempt(async () => {
      await verifyOtp({ phoneNumber: phone, role: "USER", otp });
      await completeSignIn();
      setOtp("");
      setOtpSent(false);
    });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.body}>
        <Text style={styles.title}>Session check</Text>
        <Text style={styles.note}>Temporary (step 3). Replaced by flow 1.</Text>

        {status === "initializing" ? <Text style={styles.text}>Restoring session…</Text> : null}

        {status === "authenticated" && account ? (
          <>
            <Text style={styles.text}>Signed in as {account.phoneNumber}</Text>
            <Button label="Log out" disabled={busy} onPress={() => attempt(logout)} />
          </>
        ) : null}

        {status === "unauthenticated" ? (
          <>
            <Text style={styles.text}>Signed out</Text>
            <TextInput style={styles.input} placeholder="Mobile number" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} editable={!otpSent} />
            {otpSent ? (
              <>
                <TextInput style={styles.input} placeholder="OTP" keyboardType="number-pad" value={otp} onChangeText={setOtp} autoComplete="sms-otp" textContentType="oneTimeCode" />
                <Button label="Verify" disabled={busy || !otp} onPress={verify} />
              </>
            ) : (
              <Button label="Send OTP" disabled={busy} onPress={sendOtp} />
            )}
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

function Button({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "700", color: colors.ink },
  note: { fontSize: 13, color: colors.muted },
  text: { fontSize: 16, color: colors.ink },
  input: { borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: "#fff" },
  button: { backgroundColor: colors.brand, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, fontSize: 14 },
});
