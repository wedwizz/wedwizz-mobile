import { Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SUPPORT_EMAIL } from "@/config/web-links";
import { paramString, PUBLIC_PROFILE_SECTIONS } from "@/features/user/lib/auth-gate";
import { RequireUser } from "@/features/user/routes/guards";
import { ProfileInfoView } from "./profile-info-view";

/**
 * Web profile-info-page.tsx (/user/profile/<section>). Privacy and terms are open to guests: the sign-in screens link to
 * them (on the web they sit behind RequireUser, so a guest tapping those links is sent back to welcome).
 */
export function ProfileInfoScreen() {
  const router = useRouter();
  const section = paramString(useLocalSearchParams<{ section?: string }>().section);
  const isPublic = (PUBLIC_PROFILE_SECTIONS as readonly string[]).includes(section ?? "");
  const view = (
    <ProfileInfoView
      section={section}
      backLabel={router.canGoBack() ? "Back" : "Profile"}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/user/profile"))}
      supportEmail={SUPPORT_EMAIL}
      onEmailSupport={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL ?? ""}`)}
    />
  );
  return isPublic ? view : <RequireUser>{view}</RequireUser>;
}
