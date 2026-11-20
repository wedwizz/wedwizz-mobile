/**
 * The device's random visitor id, for counting profile views once per visitor per day. Plain TS: the web passes
 * localStorage, the apps pass `appStorage` (native/storage.ts). It also accepts an async store, which is why this is async.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
}

const KEY = "wedplan.visitorId";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Used when storage is unavailable (private mode, blocked site data): one id for as long as the app is open.
let memoryId: string | null = null;

export async function visitorId(storage: KeyValueStorage | null, newId: () => string = () => crypto.randomUUID()): Promise<string> {
  try {
    const saved = storage ? await storage.getItem(KEY) : null;
    if (saved && UUID.test(saved)) {
      // Also the fallback, should a later read fail: still the same visitor.
      memoryId = saved;
      return saved;
    }
    const id = memoryId ?? newId();
    memoryId = id;
    if (storage) await storage.setItem(KEY, id);
    return id;
  } catch {
    memoryId ??= newId();
    return memoryId;
  }
}

/** Tests only: forget the in-memory id. */
export function resetVisitorIdForTests(): void {
  memoryId = null;
}
