import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { hasAccessToken, refreshAccessToken, setAccessToken } from "../api/api-client";
import * as authApi from "../api/auth.api";
import type { MeData } from "../api/types";
import { authKeys } from "../query/query-keys";

/**
 * Who is signed in, or null for a visitor. On a fresh load the access token is not in memory yet,
 * so the session is first restored from the stored refresh token (if any).
 */
async function fetchMe(): Promise<MeData | null> {
  try {
    if (!hasAccessToken()) await refreshAccessToken();
    return await authApi.getMe();
  } catch {
    // No stored token, expired or revoked session, or offline: signed out for now (an offline launch keeps the token).
    setAccessToken(null);
    return null;
  }
}

/**
 * The `/auth/me` query shared by every app (vendor, customer). Each app narrows it to its own role
 * with `select`, so one request serves every component that asks.
 */
export const meQuery = queryOptions({
  queryKey: authKeys.me(),
  queryFn: fetchMe,
  // The session only changes through sign-in, logout or expiry, which all write the cache directly.
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
});

/** After a successful OTP verification: loads the account and makes it the cached session. */
export async function loadSignedInAccount(queryClient: QueryClient): Promise<MeData> {
  const me = await authApi.getMe();
  queryClient.setQueryData(authKeys.me(), me);
  return me;
}

/**
 * Ends the session on this device: signed out in the cache and every other cached query dropped,
 * so the next account never sees this one's data. Callers also reset their app's store.
 */
export function endSession(queryClient: QueryClient): void {
  setAccessToken(null);
  queryClient.setQueryData(authKeys.me(), null);
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.all[0] });
}

/** `POST /auth/logout`, then ends the local session even if the call failed. */
export async function signOut(queryClient: QueryClient): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // The local session ends regardless; the server session expires on its own if the call failed.
  } finally {
    endSession(queryClient);
  }
}
