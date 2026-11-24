import { useCallback } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { INTRO_SLIDES } from "@/features/user/data/intro";
import { paramString } from "@/features/user/lib/auth-gate";
import { IntroView } from "./intro-view";

/**
 * After a new account's code is verified (not on the web). Skip and Continue on the last slide both lead to profile
 * setup, which returns to `from` once saved. A customer who already has a profile is sent on to Home by the setup gate.
 */
export function IntroScreen() {
  const router = useRouter();
  const from = paramString(useLocalSearchParams<{ from?: string }>().from);

  // White status bar over the photo.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  const toSetup = () => router.replace({ pathname: "/user/profile-setup", params: from ? { from } : {} });

  return <IntroView slides={INTRO_SLIDES} onSkip={toSetup} onFinish={toSetup} />;
}
