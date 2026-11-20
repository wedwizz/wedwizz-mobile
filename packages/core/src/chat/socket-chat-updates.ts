import type { ChatUpdates } from "./chat-updates";
import { CHAT_EVENT_VERSION, SOCKET_UNAUTHORIZED } from "./chat-events";

/** The part of a socket.io-client socket this module uses (a fake in tests; the same client on React Native). */
export interface ChatSocket {
  readonly connected: boolean;
  /** Connected, connecting or retrying on its own; false once refused by the server or closed by either side. */
  readonly active: boolean;
  connect(): void;
  disconnect(): void;
  on(event: "connect", listener: () => void): unknown;
  on(event: "disconnect", listener: (reason: string) => void): unknown;
  on(event: "connect_error", listener: (error: Error) => void): unknown;
  on(event: "thread:updated", listener: (event: { v: number; enquiryId: string }) => void): unknown;
  on(event: "inbox:updated", listener: (event: { v: number }) => void): unknown;
}

export interface SocketChatUpdatesDeps {
  /** Creates the socket without connecting it; `auth` is read on every (re)connect. */
  createSocket(auth: () => { token: string | null }): ChatSocket;
  getToken(): string | null;
  onTokenChange(listener: (token: string | null) => void): () => void;
  /** The app's single-flight refresh; rejects when the session is over. */
  refreshToken(): Promise<unknown>;
  /** Calls back when the app becomes visible again (a tab shown, an app brought to the foreground). */
  onVisible(listener: () => void): () => void;
  /** Used only while the socket is down (and the user is signed in): slow polling. */
  fallback: ChatUpdates;
  /**
   * Whether this session has chats at all (customers and vendors; not admins). Without it no socket is opened: the
   * server would refuse it, and refreshing the token can't change that. Defaults to every session.
   */
  canChat?(token: string): boolean;
}

/** The access token's role claim, read without verifying it: only to decide whether to try (the server checks). */
export function tokenRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "="));
    const role = (JSON.parse(json) as { role?: unknown }).role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

/** Customers and vendors have chats; admins don't (and the socket refuses them). */
export function canChatWith(token: string): boolean {
  const role = tokenRole(token);
  return role === "USER" || role === "VENDOR";
}

// One watchThread/watchInbox call; threadId null for the inbox.
interface Subscription {
  threadId: string | null;
  onChange: () => void;
  stopPolling: (() => void) | null;
}

/**
 * Chat updates pushed over one socket per signed-in user. Screens keep calling watchThread/watchInbox and refetch
 * on onChange; the socket only says when. Every (re)connect and every return to the app calls each active
 * onChange once, so nothing missed while away is lost. While disconnected, the slow polling fallback runs.
 */
export function createSocketChatUpdates(deps: SocketChatUpdatesDeps): ChatUpdates {
  const subscriptions = new Set<Subscription>();
  let socket: ChatSocket | null = null;
  let refreshing = false;
  // Set once a refusal led to a refresh; cleared by a successful connect or by signing out. While set, another refusal
  // means a refresh can't help (wrong role, server-side failure): stop and keep polling instead of looping.
  let refreshedForRefusal = false;
  const canChat = deps.canChat ?? (() => true);

  // The token, if this session has chats; otherwise it is treated as signed out (no socket, no polling).
  const chatToken = () => {
    const token = deps.getToken();
    return token !== null && canChat(token) ? token : null;
  };
  const signedIn = () => chatToken() !== null;
  const notify = (match: (sub: Subscription) => boolean) => [...subscriptions].filter(match).forEach((sub) => sub.onChange());
  const notifyAll = () => notify(() => true);

  const startPolling = (sub: Subscription) => {
    if (sub.stopPolling || !signedIn() || socket?.connected) return;
    sub.stopPolling = sub.threadId === null ? deps.fallback.watchInbox(sub.onChange) : deps.fallback.watchThread(sub.threadId, sub.onChange);
  };
  const stopPolling = (sub: Subscription) => {
    sub.stopPolling?.();
    sub.stopPolling = null;
  };
  const startAllPolling = () => subscriptions.forEach(startPolling);
  const stopAllPolling = () => subscriptions.forEach(stopPolling);

  // The server refused or closed the socket (expired or revoked token): refresh once, then reconnect. Never twice in a
  // row without a connect in between: that would loop as fast as the server answers.
  const refreshThenConnect = () => {
    if (refreshing || refreshedForRefusal) return;
    refreshing = true;
    refreshedForRefusal = true;
    deps
      .refreshToken()
      .then(() => {
        if (signedIn() && socket && !socket.active) socket.connect();
      })
      // The session is over: the app signs out (onSessionExpired), which closes the socket.
      .catch(() => undefined)
      .finally(() => {
        refreshing = false;
      });
  };

  const ensureSocket = (): ChatSocket => {
    if (socket) return socket;
    const created = deps.createSocket(() => ({ token: deps.getToken() }));
    created.on("connect", () => {
      refreshedForRefusal = false;
      stopAllPolling();
      notifyAll();
    });
    created.on("disconnect", (reason) => {
      startAllPolling();
      // Closed by the server: socket.io doesn't retry these on its own.
      if (reason === "io server disconnect") refreshThenConnect();
    });
    created.on("connect_error", (error) => {
      startAllPolling();
      if (error.message === SOCKET_UNAUTHORIZED) refreshThenConnect();
    });
    // A format this app doesn't know yet: refetch everything rather than miss something.
    created.on("thread:updated", (event) =>
      event.v === CHAT_EVENT_VERSION ? notify((sub) => sub.threadId === event.enquiryId) : notifyAll(),
    );
    created.on("inbox:updated", (event) => (event.v === CHAT_EVENT_VERSION ? notify((sub) => sub.threadId === null) : notifyAll()));
    socket = created;
    return created;
  };

  const onToken = (next: string | null) => {
    const token = next !== null && canChat(next) ? next : null;
    if (token === null) {
      // Signed out (or a session without chats, e.g. an admin): no socket, and a fresh start on the next sign-in.
      refreshedForRefusal = false;
      stopAllPolling();
      socket?.disconnect();
      return;
    }
    const current = ensureSocket();
    if (!current.connected) startAllPolling();
    // A refreshed token while connected is simply sent on the next reconnect.
    if (!current.active) current.connect();
  };

  deps.onTokenChange(onToken);
  deps.onVisible(notifyAll);
  if (signedIn()) onToken(chatToken());

  const watch = (threadId: string | null, onChange: () => void) => {
    const sub: Subscription = { threadId, onChange, stopPolling: null };
    subscriptions.add(sub);
    startPolling(sub);
    return () => {
      stopPolling(sub);
      subscriptions.delete(sub);
    };
  };

  return {
    watchThread: (threadId, onChange) => watch(threadId, onChange),
    watchInbox: (onChange) => watch(null, onChange),
  };
}
