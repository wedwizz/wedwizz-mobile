import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { toApiError } from "@wedwizz/core/api/api-error";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { RequireUser } from "@/features/user/routes/guards";
import { AccountSettingsView } from "./account-settings-view";

/** Web account-settings-page.tsx (/user/account-settings). Customers only. */
export function AccountSettingsScreen() {
  // After logging out, leave for welcome ourselves rather than via the guard (which would offer a way back here).
  const [loggedOut, setLoggedOut] = useState(false);
  if (loggedOut) return null;
  return (
    <RequireUser>
      <AccountSettings onLoggedOut={() => setLoggedOut(true)} />
    </RequireUser>
  );
}

function AccountSettings({ onLoggedOut }: { onLoggedOut: () => void }) {
  const router = useRouter();
  const { account, logout } = useUserSession();
  const [loggingOut, setLoggingOut] = useState(false);

  // Web: a "Log out?" confirmation, then sign out and go to welcome.
  const confirmLogout = () =>
    Alert.alert("Log out?", "You'll be signed out on this device and return to the welcome screen.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          setLoggingOut(true);
          logout()
            .then(() => {
              onLoggedOut();
              router.replace("/user/welcome");
            })
            .catch((err: unknown) => {
              setLoggingOut(false);
              Alert.alert("Couldn't log out", toApiError(err).message);
            });
        },
      },
    ]);

  return (
    <AccountSettingsView
      backLabel={router.canGoBack() ? "Back" : "Profile"}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/user/profile"))}
      phone={account ? `+91 ${account.phoneNumber}` : "—"}
      onLogout={confirmLogout}
      loggingOut={loggingOut}
      onDeleteAccount={() => router.push("/user/delete-account")}
    />
  );
}
