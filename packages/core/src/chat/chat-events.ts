/**
 * The realtime chat channel only says that something changed; the app then refetches through the REST API.
 * Events never carry message text, names or phone numbers. Plain TS, shared by the web and React Native apps.
 *
 * Keep in step with the API's backend/src/domain/entity/chat-event.ts. `v` is the event format version.
 */
export const CHAT_EVENT_VERSION = 1;

export interface ServerToClientEvents {
  /** A new message or contact note, a read receipt, a lead status change, the phone shared, or a booking change. */
  "thread:updated": (event: { v: number; enquiryId: string }) => void;
  /** Anything that changes the conversation list or its unread counts. */
  "inbox:updated": (event: { v: number }) => void;
}

/** The app sends nothing over the socket: messages go through the REST API. */
export type ClientToServerEvents = Record<string, never>;

/** The connect_error message the server sends for a missing, expired or revoked access token. */
export const SOCKET_UNAUTHORIZED = "unauthorized";
