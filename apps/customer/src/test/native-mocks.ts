/**
 * In-memory stand-ins for the native modules the copied logic now uses (they can't load in Node). Loaded before every
 * test file (vitest.config.mts `setupFiles`). Tests read and reset them through the same modules, e.g. `appStorage`.
 */
import { vi } from "vitest";

vi.mock("expo-sqlite/kv-store", () => {
  const values = new Map<string, string>();
  return {
    Storage: {
      getItemSync: (key: string) => values.get(key) ?? null,
      setItemSync: (key: string, value: string) => void values.set(key, value),
      removeItemSync: (key: string) => values.delete(key),
      clearSync: () => {
        values.clear();
        return true;
      },
    },
  };
});

vi.mock("expo-secure-store", () => {
  const values = new Map<string, string>();
  return {
    getItemAsync: async (key: string) => values.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => void values.set(key, value),
    deleteItemAsync: async (key: string) => void values.delete(key),
  };
});

vi.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  hasServicesEnabledAsync: async () => false,
  requestForegroundPermissionsAsync: async () => ({ status: "denied" }),
  getLastKnownPositionAsync: async () => null,
  getCurrentPositionAsync: async () => {
    throw new Error("No location in tests");
  },
}));

vi.mock("expo-crypto", () => ({ randomUUID: () => crypto.randomUUID() }));

vi.mock("react-native", () => ({
  AppState: { currentState: "active", addEventListener: () => ({ remove: () => undefined }) },
}));
