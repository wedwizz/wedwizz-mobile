import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { requestOtp } from "@wedwizz/core/api/auth.api";
import { toApiError } from "@wedwizz/core/api/api-error";
import { PHONE_NUMBER_PATTERN } from "@wedwizz/core/api/types";
import { paramString, profileSectionHref } from "@/features/user/lib/auth-gate";
import { GuestOnly } from "@/features/user/routes/guards";
import { LoginView } from "./login-view";

// From web login-page.tsx.
/** The server only accepts Indian mobile numbers (10 digits starting with 6-9). */
const SUPPORTED_DIAL = "+91";

const COUNTRIES = [
  { code: "+91", label: "India (+91)", digits: 10 },
  { code: "+971", label: "UAE (+971)", digits: 9 },
  { code: "+966", label: "Saudi Arabia (+966)", digits: 9 },
  { code: "+974", label: "Qatar (+974)", digits: 8 },
  { code: "+44", label: "UK (+44)", digits: 10 },
  { code: "+1", label: "USA (+1)", digits: 10 },
] as const;

/** Flags for the design's phone field (the web shows the country as a separate select). */
const FLAGS: Record<string, string> = { "+91": "🇮🇳", "+971": "🇦🇪", "+966": "🇸🇦", "+974": "🇶🇦", "+44": "🇬🇧", "+1": "🇺🇸" };

/** Web login-page.tsx. Guests only. `returning`: from "I already have an account". `from`: where sign-in returns to. */
export function LoginScreen() {
  return (
    <GuestOnly>
      <Login />
    </GuestOnly>
  );
}

function Login() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returning?: string; from?: string }>();
  const returning = paramString(params.returning) === "1";
  const from = paramString(params.from);
  const [dial, setDial] = useState<string>("+91");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const country = COUNTRIES.find((c) => c.code === dial) ?? COUNTRIES[0];

  const submit = async () => {
    if (sending) return;
    if (dial !== SUPPORTED_DIAL) {
      setError("Only Indian (+91) mobile numbers are supported right now.");
      return;
    }
    if (!PHONE_NUMBER_PATTERN.test(phone)) {
      setError("Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await requestOtp({ phoneNumber: phone, role: "USER" });
      // Only reached when the server confirms the OTP was sent.
      router.push({ pathname: "/user/verify-otp", params: { phone, dial, sentAt: String(Date.now()), ...(from ? { from } : {}) } });
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError.message || "Failed to send OTP. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <LoginView
      returning={returning}
      countries={COUNTRIES.map((c) => ({ value: c.code, label: c.label }))}
      dial={dial}
      flag={FLAGS[dial] ?? ""}
      onSelectCountry={(code) => {
        setDial(code);
        setPhone("");
        setError("");
      }}
      phone={phone}
      onChangePhone={(text) => {
        setPhone(text.replace(/\D/g, "").slice(0, country.digits));
        setError("");
      }}
      phoneMaxLength={country.digits}
      error={error}
      sending={sending}
      onSubmit={() => void submit()}
      // Web: a Back link to welcome. On a phone, back returns to where the customer was (e.g. the vendor whose heart they
      // tapped); welcome only when there is nothing to go back to.
      onBack={() => (router.canGoBack() ? router.back() : router.replace({ pathname: "/user/welcome", params: from ? { from } : {} }))}
      onTerms={() => router.push(profileSectionHref("terms"))}
      onPrivacy={() => router.push(profileSectionHref("privacy"))}
    />
  );
}
