import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chatTransport, createPollingChatUpdates, socketEndpoint } from "./chat-updates";
import { canChatWith, createSocketChatUpdates, tokenRole, type ChatSocket } from "./socket-chat-updates";

type Listener = (...args: never[]) => void;

/** Stands in for a socket.io-client socket: tests fire the server's side. */
class FakeSocket implements ChatSocket {
  connected = false;
  active = false;
  readonly handlers = new Map<string, Listener[]>();
  readonly connect = vi.fn(() => {
    this.active = true;
  });
  readonly disconnect = vi.fn(() => {
    this.connected = false;
    this.active = false;
  });

  on(event: string, listener: Listener) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), listener]);
    return this;
  }

  fire(event: string, ...args: unknown[]) {
    for (const listener of this.handlers.get(event) ?? []) (listener as (...a: unknown[]) => void)(...args);
  }

  serverAccepts() {
    this.connected = true;
    this.fire("connect");
  }

  // A server-side close is not retried by socket.io; a lost connection is.
  drops(reason: string) {
    this.connected = false;
    if (reason === "io server disconnect") this.active = false;
    this.fire("disconnect", reason);
  }

  // The connect middleware said no: socket.io gives up until connect() is called again.
  refuses(message: string) {
    this.active = false;
    this.fire("connect_error", new Error(message));
  }
}

function setup(initialToken: string | null = "token-1", canChat?: (token: string) => boolean) {
  let token = initialToken;
  const tokenListeners = new Set<(token: string | null) => void>();
  const visibleListeners = new Set<() => void>();
  const socket = new FakeSocket();
  let auth: (() => { token: string | null }) | null = null;
  const refreshToken = vi.fn(async () => {
    setToken("token-2");
    return "token-2";
  });
  const setToken = (next: string | null) => {
    token = next;
    tokenListeners.forEach((listener) => listener(next));
  };

  const updates = createSocketChatUpdates({
    createSocket: (readAuth) => {
      auth = readAuth;
      return socket;
    },
    getToken: () => token,
    onTokenChange: (listener) => {
      tokenListeners.add(listener);
      return () => tokenListeners.delete(listener);
    },
    refreshToken,
    onVisible: (listener) => {
      visibleListeners.add(listener);
      return () => visibleListeners.delete(listener);
    },
    fallback: createPollingChatUpdates({ threadMs: 60_000, inboxMs: 60_000 }),
    canChat,
  });

  return {
    updates,
    socket,
    refreshToken,
    setToken,
    auth: () => auth?.(),
    becomeVisible: () => visibleListeners.forEach((listener) => listener()),
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("socket chat updates", () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] }));
  afterEach(() => vi.useRealTimers());

  it("opens one socket while signed in, sending the current token on every connect", () => {
    const s = setup();
    expect(s.socket.connect).toHaveBeenCalledTimes(1);
    expect(s.auth()).toEqual({ token: "token-1" });
    s.setToken("token-9");
    expect(s.auth()).toEqual({ token: "token-9" });
  });

  it("calls only the watchers of the thread an event is about, and inbox watchers for inbox events", () => {
    const s = setup();
    s.socket.serverAccepts();
    const thread1 = vi.fn();
    const thread2 = vi.fn();
    const inbox = vi.fn();
    s.updates.watchThread("e1", thread1);
    s.updates.watchThread("e2", thread2);
    s.updates.watchInbox(inbox);

    s.socket.fire("thread:updated", { v: 1, enquiryId: "e1" });
    expect([thread1.mock.calls.length, thread2.mock.calls.length, inbox.mock.calls.length]).toEqual([1, 0, 0]);
    s.socket.fire("inbox:updated", { v: 1 });
    expect([thread1.mock.calls.length, thread2.mock.calls.length, inbox.mock.calls.length]).toEqual([1, 0, 1]);

    // An event format this app doesn't know: refetch everything rather than miss something.
    s.socket.fire("thread:updated", { v: 2, enquiryId: "e9" });
    expect([thread1.mock.calls.length, thread2.mock.calls.length, inbox.mock.calls.length]).toEqual([2, 1, 2]);
  });

  it("catches up every watcher once on each connect and reconnect, and when the app is shown again", () => {
    const s = setup();
    const thread = vi.fn();
    const inbox = vi.fn();
    s.updates.watchThread("e1", thread);
    s.updates.watchInbox(inbox);

    s.socket.serverAccepts();
    expect([thread.mock.calls.length, inbox.mock.calls.length]).toEqual([1, 1]);
    s.socket.drops("transport close");
    s.socket.serverAccepts();
    expect([thread.mock.calls.length, inbox.mock.calls.length]).toEqual([2, 2]);
    s.becomeVisible();
    expect([thread.mock.calls.length, inbox.mock.calls.length]).toEqual([3, 3]);
  });

  it("polls slowly while disconnected and stops once connected", () => {
    const s = setup();
    const thread = vi.fn();
    const stop = s.updates.watchThread("e1", thread);

    // Not connected yet: the fallback polls every 60 s.
    vi.advanceTimersByTime(60_000);
    expect(thread).toHaveBeenCalledTimes(1);
    s.socket.serverAccepts();
    expect(thread).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(180_000);
    expect(thread).toHaveBeenCalledTimes(2);

    s.socket.drops("transport close");
    vi.advanceTimersByTime(60_000);
    expect(thread).toHaveBeenCalledTimes(3);

    stop();
    vi.advanceTimersByTime(180_000);
    expect(thread).toHaveBeenCalledTimes(3);
  });

  it('refreshes the token and reconnects after an "unauthorized" refusal or a server-side close', async () => {
    const s = setup();
    s.socket.refuses("unauthorized");
    await flush();
    expect(s.refreshToken).toHaveBeenCalledTimes(1);
    expect(s.auth()).toEqual({ token: "token-2" });
    expect(s.socket.connect).toHaveBeenCalledTimes(2);

    s.socket.serverAccepts();
    // The access token expired: the server closed the socket.
    s.socket.drops("io server disconnect");
    await flush();
    expect(s.refreshToken).toHaveBeenCalledTimes(2);
    expect(s.socket.connect).toHaveBeenCalledTimes(3);

    // A network error is left to socket.io's own reconnection (1 s to 30 s backoff).
    s.socket.fire("connect_error", new Error("websocket error"));
    await flush();
    expect(s.refreshToken).toHaveBeenCalledTimes(2);
  });

  it("stays closed when the session can't be refreshed", async () => {
    const s = setup();
    s.refreshToken.mockRejectedValueOnce(new Error("session over"));
    s.socket.refuses("unauthorized");
    await flush();
    expect(s.socket.connect).toHaveBeenCalledTimes(1);
  });

  it("closes the socket and stops polling on sign-out, and opens it again on sign-in", () => {
    const s = setup();
    const inbox = vi.fn();
    s.updates.watchInbox(inbox);
    s.socket.serverAccepts();

    s.setToken(null);
    expect(s.socket.disconnect).toHaveBeenCalledTimes(1);
    s.socket.fire("disconnect", "io client disconnect");
    vi.advanceTimersByTime(180_000);
    expect(inbox).toHaveBeenCalledTimes(1);

    s.setToken("token-3");
    expect(s.socket.connect).toHaveBeenCalledTimes(2);
  });

  it("does not open a socket before sign-in", () => {
    const s = setup(null);
    expect(s.socket.connect).not.toHaveBeenCalled();
    s.setToken("token-1");
    expect(s.socket.connect).toHaveBeenCalledTimes(1);
  });
});

// An access token as the API issues it: header.payload.signature, base64url (only the role is read here).
const jwtFor = (role: string) => `h.${btoa(JSON.stringify({ accountId: "a1", role })).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")}.sig`;

describe("refusals a refresh can't fix", () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] }));
  afterEach(() => vi.useRealTimers());

  it("never opens a socket (nor refreshes) for an admin session", async () => {
    const s = setup(jwtFor("ADMIN"), canChatWith);
    const inbox = vi.fn();
    s.updates.watchInbox(inbox);
    s.setToken(jwtFor("ADMIN"));
    await flush();
    expect(s.socket.connect).not.toHaveBeenCalled();
    expect(s.refreshToken).not.toHaveBeenCalled();
    // Nor does it poll: an admin has no chats.
    vi.advanceTimersByTime(180_000);
    expect(inbox).not.toHaveBeenCalled();
  });

  it("refreshes once, then stops instead of looping when the server keeps refusing", async () => {
    const s = setup();
    s.socket.refuses("unauthorized");
    await flush();
    expect(s.refreshToken).toHaveBeenCalledTimes(1);
    expect(s.socket.connect).toHaveBeenCalledTimes(2);

    // Refused again with the fresh token: a refresh can't help. Nothing more is asked of the server.
    for (let i = 0; i < 5; i++) {
      s.socket.refuses("unauthorized");
      await flush();
    }
    expect(s.refreshToken).toHaveBeenCalledTimes(1);
    expect(s.socket.connect).toHaveBeenCalledTimes(2);
  });

  it("still polls slowly while stopped, and starts fresh after signing in again", async () => {
    const s = setup();
    const inbox = vi.fn();
    s.updates.watchInbox(inbox);
    s.socket.refuses("unauthorized");
    await flush();
    s.socket.refuses("unauthorized");
    await flush();
    vi.advanceTimersByTime(60_000);
    expect(inbox).toHaveBeenCalledTimes(1);

    s.setToken(null);
    s.setToken("token-7");
    s.socket.refuses("unauthorized");
    await flush();
    expect(s.refreshToken).toHaveBeenCalledTimes(2);
  });

  it("allows a refresh again once a connection succeeded (e.g. the token expires later)", async () => {
    const s = setup();
    s.socket.refuses("unauthorized");
    await flush();
    s.socket.serverAccepts();
    s.socket.drops("io server disconnect");
    await flush();
    expect(s.refreshToken).toHaveBeenCalledTimes(2);
  });

  it("reads the role from the access token, and treats anything unreadable as no chats", () => {
    expect(tokenRole(jwtFor("VENDOR"))).toBe("VENDOR");
    expect(canChatWith(jwtFor("USER"))).toBe(true);
    expect(canChatWith(jwtFor("VENDOR"))).toBe(true);
    expect(canChatWith(jwtFor("ADMIN"))).toBe(false);
    expect(canChatWith("not-a-jwt")).toBe(false);
    expect(canChatWith("a.%%%.c")).toBe(false);
  });
});

describe("chat transport choice", () => {
  it("uses the socket unless VITE_CHAT_TRANSPORT is poll", () => {
    expect(chatTransport(undefined)).toBe("socket");
    expect(chatTransport("socket")).toBe("socket");
    expect(chatTransport("poll")).toBe("poll");
  });

  it("finds the socket next to the API, also through the dev proxy", () => {
    expect(socketEndpoint("http://localhost:3000/api/v1", "http://localhost:5173")).toEqual({
      url: "http://localhost:3000",
      path: "/api/v1/socket.io",
    });
    expect(socketEndpoint("/api/v1/", "https://app.example.in")).toEqual({ url: "https://app.example.in", path: "/api/v1/socket.io" });
  });
});
