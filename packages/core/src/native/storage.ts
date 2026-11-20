/**
 * The phone's synchronous key-value stores, replacing the web's localStorage and sessionStorage for the shared code
 * that takes a `SyncStorage` (geo.ts, pending-action.ts, visitor-id.ts).
 */
import { Storage } from "expo-sqlite/kv-store";
import type { SyncStorage } from "../geo/geo";

/**
 * Kept between launches, until the app is uninstalled (the web's localStorage). expo-sqlite's kv-store: synchronous,
 * which pending-action.ts and the store's initial state need. Errors surface as throws, which the callers already
 * catch (they treat storage as optional, like blocked site data on the web).
 */
export const appStorage: SyncStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};

/** For this run of the app only (the web's sessionStorage, gone when the tab closes): memory, never written to disk. */
export function createVisitStorage(): SyncStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

export const visitStorage: SyncStorage = createVisitStorage();
