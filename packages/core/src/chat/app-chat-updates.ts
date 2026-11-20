/**
 * The app's chat updates: the wiring the web keeps at the bottom of chat-updates.ts, for React Native. "Visible
 * again" is the app coming back to the foreground (`AppState` "active") instead of a browser tab being shown.
 * Kept out of chat-updates.ts so that file (and its tests) never loads React Native.
 */
import { AppState } from "react-native";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, getAccessToken, onAccessTokenChange, refreshAccessToken } from "../api/api-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./chat-events";
import { CHAT_FALLBACK_POLL_MS, CHAT_POLL_INTERVALS, chatTransport, createPollingChatUpdates, socketEndpoint, type ChatUpdates } from "./chat-updates";
import { canChatWith, createSocketChatUpdates } from "./socket-chat-updates";

// In the background (or the app switcher), nothing is polled; it catches up when the app is active again.
const isHidden = () => AppState.currentState !== "active";

function createAppChatUpdates(): ChatUpdates {
  const polling = createPollingChatUpdates({ ...CHAT_POLL_INTERVALS, isPaused: isHidden });
  if (chatTransport(process.env.EXPO_PUBLIC_CHAT_TRANSPORT) === "poll") return polling;

  // API_BASE_URL is absolute in the apps, so it is its own origin.
  const { url, path } = socketEndpoint(API_BASE_URL, API_BASE_URL);
  return createSocketChatUpdates({
    createSocket: (auth) => {
      const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(url, {
        path,
        // WebSocket only: no long-polling, so no sticky sessions behind the load balancer.
        transports: ["websocket"],
        autoConnect: false,
        // Read on every (re)connect, so a refreshed token is used.
        auth: (send) => send(auth()),
        reconnectionDelay: 1_000,
        reconnectionDelayMax: 30_000,
        randomizationFactor: 0.5,
      });
      return socket;
    },
    getToken: getAccessToken,
    onTokenChange: onAccessTokenChange,
    refreshToken: refreshAccessToken,
    // Only customer and vendor sessions have chats (both apps sign in as one of them).
    canChat: canChatWith,
    onVisible: (listener) => {
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") listener();
      });
      return () => subscription.remove();
    },
    fallback: createPollingChatUpdates({ threadMs: CHAT_FALLBACK_POLL_MS, inboxMs: CHAT_FALLBACK_POLL_MS, isPaused: isHidden }),
  });
}

/** The app's chat updates (EXPO_PUBLIC_CHAT_TRANSPORT=socket|poll, default socket). */
export const chatUpdates: ChatUpdates = createAppChatUpdates();
