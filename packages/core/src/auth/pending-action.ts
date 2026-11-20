/**
 * What a signed-out visitor tried to do (save a listing, message, WhatsApp, call) before being asked to log in, so it
 * can finish once they are back on the same page. Kept for at most 10 minutes: a
 * reload during OTP keeps it, a later visit doesn't run something the visitor has forgotten about.
 * Plain TS: the web passes sessionStorage; the apps pass `appStorage` (native/storage.ts), so it also survives the
 * phone closing the app in the background while the visitor reads the OTP SMS.
 */
export type PendingActionType = "favourite" | "message" | "whatsapp" | "call";

export interface PendingAction {
  type: PendingActionType;
  /** The listing it was for. */
  slug: string;
  /** The page (path and search) it was started on; it only resumes there. */
  from: string;
  /** Epoch milliseconds. */
  savedAt: number;
  /** "Ask about this date": the date and guests picked before logging in. */
  draft?: { source: "MESSAGE" | "AVAILABILITY_CHECK"; eventDate: string | null; guestCount: number | null };
}

export interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const PENDING_ACTION_KEY = "wedplan.pendingAction";
export const PENDING_ACTION_TTL_MS = 10 * 60_000;

const TYPES: readonly string[] = ["favourite", "message", "whatsapp", "call"] satisfies PendingActionType[];

/** Remembers the action (one at a time: a newer one replaces it). */
export function savePendingAction(storage: SyncStorage | null, action: PendingAction): void {
  try {
    storage?.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
  } catch {
    // Storage full or blocked: the visitor just repeats the tap after logging in.
  }
}

/**
 * The saved action if it is of this type, for this listing, started on this page and still fresh; it is removed in
 * the same call, so it runs once. An expired or unreadable one is removed too; one for something else is kept.
 */
export function takePendingAction(
  storage: SyncStorage | null,
  match: { type: PendingActionType; slug: string; path: string },
  now: number = Date.now(),
): PendingAction | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(PENDING_ACTION_KEY);
    if (raw === null) return null;
    const action = parse(raw);
    if (!action || now - action.savedAt > PENDING_ACTION_TTL_MS || action.savedAt > now) {
      storage.removeItem(PENDING_ACTION_KEY);
      return null;
    }
    if (action.type !== match.type || action.slug !== match.slug || action.from !== match.path) return null;
    storage.removeItem(PENDING_ACTION_KEY);
    return action;
  } catch {
    return null;
  }
}

function parse(raw: string): PendingAction | null {
  try {
    const value = JSON.parse(raw) as Partial<PendingAction> | null;
    if (
      !value ||
      typeof value.type !== "string" ||
      !TYPES.includes(value.type) ||
      typeof value.slug !== "string" ||
      typeof value.from !== "string" ||
      typeof value.savedAt !== "number"
    ) {
      return null;
    }
    return value as PendingAction;
  } catch {
    return null;
  }
}
