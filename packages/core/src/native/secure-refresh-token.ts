/**
 * Where the apps keep the refresh token: the phone's secure storage (iOS Keychain, Android Keystore-encrypted), which
 * replaces the web's httpOnly cookie. Each app (customer, vendor) has its own, so the two never share a session.
 */
import * as SecureStore from "expo-secure-store";
import { setRefreshTokenStore, type RefreshTokenStore } from "../api/api-client";
import type { SyncStorage } from "../geo/geo";

export const REFRESH_TOKEN_KEY = "wedwizz.refreshToken";
/** Written to app storage on the first launch; app storage is deleted on uninstall, the iOS Keychain isn't. */
export const INSTALLED_KEY = "wedwizz.installed";

export interface SecureStoreLike {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

/**
 * The refresh-token store. On the first launch after an install it first deletes any token left behind in the iOS
 * Keychain by an earlier install, so reinstalling the app always starts signed out.
 */
export function createSecureRefreshTokenStore(appStorage: SyncStorage, secureStore: SecureStoreLike = SecureStore): RefreshTokenStore {
  let firstLaunch = false;
  try {
    firstLaunch = appStorage.getItem(INSTALLED_KEY) === null;
    if (firstLaunch) appStorage.setItem(INSTALLED_KEY, "1");
  } catch {
    // App storage unreadable: keep whatever token there is rather than sign out.
  }
  const ready = firstLaunch ? secureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined) : Promise.resolve();

  return {
    get: async () => {
      await ready;
      return secureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },
    set: async (token) => {
      await ready;
      await secureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    },
    clear: async () => {
      await ready;
      await secureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    },
  };
}

/** Call once at app start (root layout), before anything restores the session. */
export function installSecureRefreshTokenStore(appStorage: SyncStorage): void {
  setRefreshTokenStore(createSecureRefreshTokenStore(appStorage));
}
