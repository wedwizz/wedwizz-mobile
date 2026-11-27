import { Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VENDOR_LOGIN_URL } from "@/config/web-links";
import { paramString, profileSectionHref } from "@/features/user/lib/auth-gate";
import { GuestOnly } from "@/features/user/routes/guards";
import { WelcomeView } from "./welcome-view";

// Bundled, so the first screen shows at once and works offline (it was a random online sample photo).
const WELCOME_PHOTO = require("@/assets/images/onboarding-1.jpg") as number;

/** Web welcome-page.tsx. Guests only. `from`: the customer page that sent them here; sign-in returns there. */
const vendorLoginUrl = VENDOR_LOGIN_URL;

export function WelcomeScreen() {
  const router = useRouter();
  const from = paramString(useLocalSearchParams<{ from?: string }>().from);
  const fromParam = from ? { from } : {};
  return (
    <GuestOnly>
      <WelcomeView
        heroImage={WELCOME_PHOTO}
        onGetStarted={() => router.push({ pathname: "/user/login", params: fromParam })}
        // The web passes only `returning` here; `from` is kept too, so a returning customer also comes back to their page.
        onHaveAccount={() => router.push({ pathname: "/user/login", params: { returning: "1", ...fromParam } })}
        onTerms={() => router.push(profileSectionHref("terms"))}
        onPrivacy={() => router.push(profileSectionHref("privacy"))}
        onVendorLogin={vendorLoginUrl ? () => void Linking.openURL(vendorLoginUrl) : undefined}
      />
    </GuestOnly>
  );
}
