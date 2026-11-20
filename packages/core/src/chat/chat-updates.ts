/**
 * How open chat screens learn that a thread or the inbox may have changed. Screens call `watch*` while
 * they are shown and refetch their data on `onChange`; they never poll on their own. Two implementations:
 * pushed over a socket (socket-chat-updates.ts, the default) or polling (below). `chatUpdates` in
 * app-chat-updates.ts picks one for the app.
 * Plain TypeScript (no React Native), so it runs in unit tests.
 */

export interface ChatUpdates {
  /** Calls `onChange` whenever the thread may have new messages, until the returned function is called. */
  watchThread(threadId: string, onChange: () => void): () => void;
  /** Calls `onChange` whenever the list of conversations may have changed. */
  watchInbox(onChange: () => void): () => void;
}

export interface PollingOptions {
  threadMs: number;
  inboxMs: number;
  /** While true (e.g. the tab is in the background), polls are skipped. */
  isPaused?: () => boolean;
}

/** About 10 s while a thread is open, 60 s for an inbox. */
export const CHAT_POLL_INTERVALS = { threadMs: 10_000, inboxMs: 60_000 } as const;

export function createPollingChatUpdates({ threadMs, inboxMs, isPaused = () => false }: PollingOptions): ChatUpdates {
  const poll = (intervalMs: number, onChange: () => void) => {
    const id = setInterval(() => {
      if (!isPaused()) onChange();
    }, intervalMs);
    return () => clearInterval(id);
  };
  return {
    watchThread: (_threadId, onChange) => poll(threadMs, onChange),
    watchInbox: (onChange) => poll(inboxMs, onChange),
  };
}

/** While the socket is down, both threads and the inbox are polled this slowly; reconnecting catches up at once. */
export const CHAT_FALLBACK_POLL_MS = CHAT_POLL_INTERVALS.inboxMs;

export type ChatTransport = "socket" | "poll";

/** `EXPO_PUBLIC_CHAT_TRANSPORT`: "poll" keeps the old polling; anything else (or unset) uses the socket. */
export function chatTransport(value: string | undefined): ChatTransport {
  return value === "poll" ? "poll" : "socket";
}

/**
 * Where the chat socket is, from the API base URL: the same origin, at `<base path>/socket.io`
 * (e.g. /api/v1/socket.io). A relative base resolves against `pageOrigin` (the web's dev proxy; the apps always pass an absolute URL).
 */
export function socketEndpoint(apiBaseUrl: string, pageOrigin: string): { url: string; path: string } {
  const base = new URL(apiBaseUrl, pageOrigin);
  return { url: base.origin, path: `${base.pathname.replace(/\/+$/, "")}/socket.io` };
}

