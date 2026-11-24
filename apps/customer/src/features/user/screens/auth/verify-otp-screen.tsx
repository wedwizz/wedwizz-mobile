import { useEffect, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { requestOtp, verifyOtp } from "@wedwizz/core/api/auth.api";
import { toApiError } from "@wedwizz/core/api/api-error";
import { OTP_PATTERN } from "@wedwizz/core/api/types";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { paramString } from "@/features/user/lib/auth-gate";
import { afterVerify, type AfterVerify } from "@/features/user/screens/onboarding/intro-logic";
import { VerifyOtpView } from "./verify-otp-view";

// From web verify-otp-page.tsx.
const LENGTH = 6;
/** The server's default resend cooldown; a 429 from the server overrides it with the exact wait. */
const RESEND_SECONDS = 60;

const mask = (phone: string): string => `${phone.slice(0, 2)}${"•".repeat(Math.max(phone.length - 5, 0))}${phone.slice(-3)}`;

function secondsUntilResend(sentAt?: number): number {
  if (!sentAt) return RESEND_SECONDS;
  return Math.max(0, RESEND_SECONDS - Math.floor((Date.now() - sentAt) / 1000));
}

/**
 * Web verify-otp-page.tsx. Not guarded (as the web): it signs the customer in, then shows its own success step.
 * Params from login: phone, dial, sentAt, and `from` (the customer page that asked for sign-in).
 */
export function VerifyOtpScreen() {
  const router = useRouter();
  const { completeSignIn } = useUserSession();
  const params = useLocalSearchParams<{ phone?: string; dial?: string; sentAt?: string; from?: string }>();
  const phone = paramString(params.phone);
  const dial = paramString(params.dial) ?? "+91";
  const from = paramString(params.from);
  const sentAt = Number(paramString(params.sentAt)) || undefined;
  const [otp, setOtp] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(() => secondsUntilResend(sentAt));

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  if (!phone) return <Redirect href="/user/login" />;
  const code = otp.join("");
  const complete = OTP_PATTERN.test(code);

  const leave = (to: AfterVerify) => {
    // Back to `from` if it is under the sign-in screens, else replace them with it.
    if (typeof to === "string") return router.dismissTo(to as Href);
    // The intro replaces the sign-in screens, so Back from it never returns to the code screen.
    if (router.canDismiss()) router.dismissAll();
    router.replace(to);
  };

  const verify = async () => {
    let signedIn: { isNewAccount: boolean };
    if (!complete || verifying) return;
    setVerifying(true);
    setError("");
    setNotice("");
    try {
      // The server checks the code; the refresh token is kept in the phone's secure storage.
      signedIn = await verifyOtp({ phoneNumber: phone, role: "USER", otp: code });
    } catch (err) {
      const apiError = toApiError(err);
      const attemptsRemaining = apiError.numberDetail("attemptsRemaining");
      setError(
        attemptsRemaining !== undefined
          ? `${apiError.message}. ${attemptsRemaining} ${attemptsRemaining === 1 ? "attempt" : "attempts"} left.`
          : apiError.message,
      );
      // Locked or expired codes cannot succeed any more: clear them and point to resend.
      if (apiError.status === 429 || attemptsRemaining === undefined) setOtp(Array(LENGTH).fill(""));
      setVerifying(false);
      return;
    }

    try {
      await completeSignIn();
      // No "Number verified" step (onboarding designs): a new account goes to the intro slides, then setup.
      leave(afterVerify(signedIn.isNewAccount, from));
    } catch {
      // The code was accepted and the session is stored; only loading the account failed.
      setError("You're signed in, but we couldn't load your account. Please close and reopen the app.");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    setError("");
    setNotice("");
    try {
      await requestOtp({ phoneNumber: phone, role: "USER" });
      setOtp(Array(LENGTH).fill(""));
      setSeconds(RESEND_SECONDS);
      setNotice("A new code has been sent.");
    } catch (err) {
      const apiError = toApiError(err);
      const retryAfter = apiError.numberDetail("retryAfterSeconds");
      if (retryAfter) setSeconds(retryAfter);
      setError(apiError.message);
    } finally {
      setResending(false);
    }
  };


  return (
    <VerifyOtpView
      maskedPhone={`${dial} ${mask(phone)}`}
      otp={otp}
      onChangeOtp={(v) => {
        setOtp(v);
        setError("");
      }}
      error={error}
      notice={notice}
      canVerify={complete}
      verifying={verifying}
      onVerify={() => void verify()}
      resendSeconds={seconds}
      resending={resending}
      onResend={() => void resend()}
      // Web: navigate to login with `from`. Here: back to the login screen underneath, which keeps `from`.
      onChangePhone={() => router.dismissTo({ pathname: "/user/login", params: from ? { from } : {} })}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/user/login"))}
    />
  );
}
