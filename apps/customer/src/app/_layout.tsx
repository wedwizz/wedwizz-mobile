import { useEffect } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider, focusManager, useQueryClient } from "@tanstack/react-query";
import { onSessionExpired } from "@wedwizz/core/api/api-client";
import { installSecureRefreshTokenStore } from "@wedwizz/core/native/secure-refresh-token";
import { appStorage } from "@wedwizz/core/native/storage";
import { queryClient } from "@wedwizz/core/query/query-client";
import { endUserSession } from "@/features/user/hooks/use-user-session";

// Before anything restores the session: the refresh token lives in the phone's secure storage.
installSecureRefreshTokenStore(appStorage);

// TanStack Query refetches stale data when the window regains focus; on a phone that is the app becoming active.
focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener("change", (state) => setFocused(state === "active"));
  return () => subscription.remove();
});

/** Signs the customer out when the session can't be refreshed (as the web's user-root.tsx). */
function SessionExpiry() {
  const client = useQueryClient();
  useEffect(() => onSessionExpired(() => endUserSession(client)), [client]);
  return null;
}

// Screens outside the tabs (login, detail pages, chat threads) are added to this stack in their flows.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionExpiry />
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
