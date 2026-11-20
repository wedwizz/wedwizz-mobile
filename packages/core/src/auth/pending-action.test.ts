import { describe, expect, it } from "vitest";
import {
  PENDING_ACTION_KEY,
  PENDING_ACTION_TTL_MS,
  savePendingAction,
  takePendingAction,
  type PendingAction,
  type SyncStorage,
} from "./pending-action";

function memoryStorage(): SyncStorage & { raw: () => string | null } {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
    raw: () => values.get(PENDING_ACTION_KEY) ?? null,
  };
}

const NOW = 1_800_000_000_000;
const heart: PendingAction = { type: "favourite", slug: "lumen-stories-kochi", from: "/user/vendors/lumen-stories-kochi", savedAt: NOW };
const match = { type: "favourite" as const, slug: heart.slug, path: heart.from };

describe("pending action", () => {
  it("is taken once, on the page and for the listing it was started on", () => {
    const storage = memoryStorage();
    savePendingAction(storage, heart);
    expect(takePendingAction(storage, match, NOW + 1000)).toEqual(heart);
    expect(takePendingAction(storage, match, NOW + 1000)).toBeNull();
    expect(storage.raw()).toBeNull();
  });

  it("is kept for another listing, page or action, until its own comes", () => {
    const storage = memoryStorage();
    savePendingAction(storage, heart);
    expect(takePendingAction(storage, { ...match, slug: "other-kochi" }, NOW)).toBeNull();
    expect(takePendingAction(storage, { ...match, path: "/user/vendors/lumen-stories-kochi?tab=reviews" }, NOW)).toBeNull();
    expect(takePendingAction(storage, { ...match, type: "message" }, NOW)).toBeNull();
    expect(takePendingAction(storage, match, NOW)).toEqual(heart);
  });

  it("is dropped after 10 minutes, or when it can't be read", () => {
    const storage = memoryStorage();
    savePendingAction(storage, heart);
    expect(takePendingAction(storage, match, NOW + PENDING_ACTION_TTL_MS + 1)).toBeNull();
    expect(storage.raw()).toBeNull();

    for (const raw of ["{not json", JSON.stringify({ ...heart, type: "delete-account" }), JSON.stringify({ ...heart, savedAt: "soon" })]) {
      storage.setItem(PENDING_ACTION_KEY, raw);
      expect(takePendingAction(storage, match, NOW)).toBeNull();
      expect(storage.raw()).toBeNull();
    }
  });

  it("keeps the details of an availability question", () => {
    const storage = memoryStorage();
    const ask: PendingAction = { ...heart, type: "message", draft: { source: "AVAILABILITY_CHECK", eventDate: "2027-01-20", guestCount: 400 } };
    savePendingAction(storage, ask);
    expect(takePendingAction(storage, { ...match, type: "message" }, NOW)?.draft).toEqual(ask.draft);
  });

  it("does nothing without storage, or when storage throws", () => {
    expect(() => savePendingAction(null, heart)).not.toThrow();
    expect(takePendingAction(null, match, NOW)).toBeNull();
    const broken: SyncStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {},
    };
    expect(() => savePendingAction(broken, heart)).not.toThrow();
    expect(takePendingAction(broken, match, NOW)).toBeNull();
  });
});
