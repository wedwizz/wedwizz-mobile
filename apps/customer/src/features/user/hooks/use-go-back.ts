import { useCallback } from "react";
import { useRouter } from "expo-router";

/**
 * Back for the customer app's own Back buttons: the previous screen, or Home when there is none in the app. A screen
 * opened from a shared link is the first screen of the stack, and its Back button is the only way out of it. Home
 * replaces it, so Android's back gesture doesn't bounce between the two.
 * (Web: React Router's "default" location key; here: the stack can't go back.)
 */
export function useGoBack() {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/user/home");
  }, [router]);
}
