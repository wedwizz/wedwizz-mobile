import { Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VENDOR_LOGIN_URL } from "@/config/web-links";
import { paramString, profileSectionHref } from "@/features/user/lib/auth-gate";
import { photo } from "@/features/user/lib/images";
import { GuestOnly } from "@/features/user/routes/guards";
import { WelcomeView } from "./welcome-view";

/** Web welcome-page.tsx. Guests only. `from`: the customer page that sent them here; sign-in returns there. */
const vendorLoginUrl = VENDOR_LOGIN_URL;

export function WelcomeScreen() {
  const router = useRouter();
  const from = paramString(useLocalSearchParams<{ from?: string }>().from);
  const fromParam = from ? { from } : {};
  return (
    <GuestOnly>
      <WelcomeView
        heroImage={photo("welcome-hero", 900, 1400)}
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
