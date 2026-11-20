import type { ChatMessage, LeadStatus } from "../api/types";

/** Plain TS shared by the customer and vendor chat screens (and later the mobile app). */

/** Status labels: customers see where their enquiry stands, vendors their pipeline. */
const CUSTOMER_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "Awaiting reply",
  REPLIED: "Replied",
  QUOTED: "Quote shared",
  BOOKED: "Booked",
  LOST: "Closed",
  DECLINED: "Declined",
};
const VENDOR_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  REPLIED: "Replied",
  QUOTED: "Quoted",
  BOOKED: "Booked",
  LOST: "Lost",
  DECLINED: "Declined",
};

export function leadStatusLabel(status: LeadStatus, side: "customer" | "vendor"): string {
  return (side === "customer" ? CUSTOMER_STATUS_LABEL : VENDOR_STATUS_LABEL)[status];
}

const CONTACT_WAY = { WHATSAPP: "on WhatsApp", CALL: "by phone" } as const;

/**
 * The note a WhatsApp or Call tap leaves in a thread: "Anjali contacted you on WhatsApp" for the vendor, "You
 * contacted them by phone" for the customer. Null for a text message.
 */
export function contactNoteLabel(message: Pick<ChatMessage, "kind">, side: "customer" | "vendor", customerName = "The customer"): string | null {
  if (message.kind === "TEXT") return null;
  return side === "vendor" ? `${customerName} contacted you ${CONTACT_WAY[message.kind]}` : `You contacted them ${CONTACT_WAY[message.kind]}`;
}

/** What an inbox row shows of the latest message: its text, or the contact note. */
export function messagePreview(message: Pick<ChatMessage, "kind" | "text">, side: "customer" | "vendor", customerName?: string): string {
  return contactNoteLabel(message, side, customerName) ?? message.text;
}

const sameDay =(a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "10:42 am" for a message. */
export function messageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** Inbox time: "now", "5m", "3h", "Yesterday", or "12 Oct". */
export function inboxTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (sameDay(then, now)) return `${Math.floor(minutes / 60)}h`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(then, yesterday)) return "Yesterday";
  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** "29/10/2026" for a "YYYY-MM-DD" event date, as the message templates write it. */
export function formatEventDate(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}/${month}/${year}`;
}

/** "Sun, 14 Feb, 2027" (en-IN), or "Date not fixed yet". */
export function eventDateLabel(day: string | null): string {
  if (!day) return "Date not fixed yet";
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/** "Replied in 45 min" / "Replied in 3 h" / "Replied in 2 days". */
export function responseTimeLabel(seconds: number | null): string | null {
  if (seconds === null) return null;
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `Replied in ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `Replied in ${hours} h`;
  return `Replied in ${Math.round(hours / 24)} days`;
}

/**
 * Pages of a thread (each newest first, the latest page first) as one list, oldest first, without
 * duplicates: a message can appear on two pages when new ones arrive between fetches.
 */
export function threadMessages(pages: { messages: ChatMessage[] }[]): ChatMessage[] {
  const seen = new Set<string>();
  const all: ChatMessage[] = [];
  for (const page of pages) {
    for (const message of page.messages) {
      if (seen.has(message.messageId)) continue;
      seen.add(message.messageId);
      all.push(message);
    }
  }
  return all.sort((a, b) => a.sentAt.localeCompare(b.sentAt) || a.messageId.localeCompare(b.messageId));
}

export interface MessageDay {
  /** "Today", "Yesterday" or "12 Oct 2026". */
  label: string;
  messages: ChatMessage[];
}

/** Oldest-first messages split by calendar day, for day separators in a thread. */
export function groupByDay(messages: ChatMessage[], now: Date = new Date()): MessageDay[] {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const days: MessageDay[] = [];
  for (const message of messages) {
    const sent = new Date(message.sentAt);
    const label = sameDay(sent, now)
      ? "Today"
      : sameDay(sent, yesterday)
        ? "Yesterday"
        : sent.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const last = days[days.length - 1];
    if (last && last.label === label) last.messages.push(message);
    else days.push({ label, messages: [message] });
  }
  return days;
}
