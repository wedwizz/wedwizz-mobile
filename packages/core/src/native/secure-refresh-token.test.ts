import { describe, expect, it, vi } from "vitest";
import type { SyncStorage } from "../geo/geo";
import { INSTALLED_KEY, REFRESH_TOKEN_KEY, createSecureRefreshTokenStore, type SecureStoreLike } from "./secure-refresh-token";

vi.mock("expo-secure-store", () => ({}));

function memory(initial: Record<string, string> = {}): SyncStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

function fakeSecureStore(initial: Record<string, string> = {}): SecureStoreLike & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItemAsync: async (key) => values.get(key) ?? null,
    setItemAsync: async (key, value) => void values.set(key, value),
    deleteItemAsync: async (key) => void values.delete(key),
  };
}

describe("secure refresh-token store", () => {
  it("keeps, reads and clears the token in secure storage", async () => {
    const secure = fakeSecureStore();
    const store = createSecureRefreshTokenStore(memory({ [INSTALLED_KEY]: "1" }), secure);
    await store.set("refresh-1");
    expect(secure.values.get(REFRESH_TOKEN_KEY)).toBe("refresh-1");
    expect(await store.get()).toBe("refresh-1");
    await store.clear();
    expect(await store.get()).toBeNull();
  });

  it("starts signed out after a reinstall, when the iOS Keychain still holds the old install's token", async () => {
    const app = memory(); // a fresh install: app storage is empty
    const secure = fakeSecureStore({ [REFRESH_TOKEN_KEY]: "from-old-install" });
    const store = createSecureRefreshTokenStore(app, secure);
    expect(await store.get()).toBeNull();
    expect(app.values.get(INSTALLED_KEY)).toBe("1");
  });

  it("keeps the token on every later launch", async () => {
    const secure = fakeSecureStore({ [REFRESH_TOKEN_KEY]: "refresh-1" });
    expect(await createSecureRefreshTokenStore(memory({ [INSTALLED_KEY]: "1" }), secure).get()).toBe("refresh-1");
  });

  it("keeps the token when app storage can't be read, rather than signing out", async () => {
    const broken: SyncStorage = {
      getItem: () => {
        throw new Error("disk");
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    const secure = fakeSecureStore({ [REFRESH_TOKEN_KEY]: "refresh-1" });
    expect(await createSecureRefreshTokenStore(broken, secure).get()).toBe("refresh-1");
  });
});
