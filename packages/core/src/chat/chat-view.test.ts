import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../api/types";
import {
  contactNoteLabel,
  eventDateLabel,
  formatEventDate,
  groupByDay,
  inboxTime,
  leadStatusLabel,
  messagePreview,
  responseTimeLabel,
  threadMessages,
} from "./chat-view";

const message = (messageId: string, sentAt: string): ChatMessage => ({ messageId, sender: "CUSTOMER", kind: "TEXT", text: messageId, sentAt, readAt: null });

describe("chat view helpers", () => {
  it("joins thread pages oldest first, without the duplicates new messages cause between fetches", () => {
    const latest = { messages: [message("m4", "2026-10-29T10:03:00Z"), message("m3", "2026-10-29T10:02:00Z")] };
    // Fetched before m4 arrived, so it starts one message later and repeats m3.
    const older = { messages: [message("m3", "2026-10-29T10:02:00Z"), message("m2", "2026-10-29T10:01:00Z"), message("m1", "2026-10-29T10:00:00Z")] };

    expect(threadMessages([latest, older]).map((m) => m.messageId)).toEqual(["m1", "m2", "m3", "m4"]);
    expect(threadMessages([])).toEqual([]);
  });

  it("groups messages by local day for separators", () => {
    const now = new Date(2026, 9, 29, 18, 0);
    const at = (day: number, hour: number) => new Date(2026, 9, day, hour, 0).toISOString();
    const days = groupByDay([message("a", at(20, 9)), message("b", at(28, 9)), message("c", at(28, 22)), message("d", at(29, 8))], now);

    expect(days.map((d) => [d.label, d.messages.map((m) => m.messageId)])).toEqual([
      ["20 Oct 2026", ["a"]],
      ["Yesterday", ["b", "c"]],
      ["Today", ["d"]],
    ]);
  });

  it("labels inbox times relative to now", () => {
    const now = new Date(2026, 9, 29, 18, 0);
    const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
    expect(inboxTime(ago(0), now)).toBe("now");
    expect(inboxTime(ago(5), now)).toBe("5m");
    expect(inboxTime(ago(180), now)).toBe("3h");
    expect(inboxTime(new Date(2026, 9, 28, 23, 0).toISOString(), now)).toBe("Yesterday");
    expect(inboxTime(new Date(2026, 9, 12, 9, 0).toISOString(), now)).toBe("12 Oct");
  });

  it("formats event dates, response times and status labels for each side", () => {
    expect(formatEventDate("2026-10-29")).toBe("29/10/2026");
    expect(eventDateLabel(null)).toBe("Date not fixed yet");
    expect(eventDateLabel("2027-02-14")).toMatch(/^Sun, 14 Feb,? 2027$/);
    expect(responseTimeLabel(null)).toBeNull();
    expect(responseTimeLabel(20)).toBe("Replied in 1 min");
    expect(responseTimeLabel(45 * 60)).toBe("Replied in 45 min");
    expect(responseTimeLabel(3 * 3600)).toBe("Replied in 3 h");
    expect(responseTimeLabel(3 * 86400)).toBe("Replied in 3 days");
    expect(leadStatusLabel("NEW", "customer")).toBe("Awaiting reply");
    expect(leadStatusLabel("NEW", "vendor")).toBe("New");
    expect(leadStatusLabel("LOST", "customer")).toBe("Closed");
  });

  it("labels WhatsApp and Call notes for each side, and previews text as it is", () => {
    const whatsapp = { kind: "WHATSAPP" as const, text: "" };
    expect(contactNoteLabel(whatsapp, "vendor", "Anjali Menon")).toBe("Anjali Menon contacted you on WhatsApp");
    expect(contactNoteLabel({ kind: "CALL" }, "customer")).toBe("You contacted them by phone");
    expect(contactNoteLabel({ kind: "CALL" }, "vendor")).toBe("The customer contacted you by phone");
    expect(contactNoteLabel({ kind: "TEXT" }, "vendor")).toBeNull();
    expect(messagePreview(whatsapp, "customer")).toBe("You contacted them on WhatsApp");
    expect(messagePreview({ kind: "TEXT", text: "Is 14 Feb free?" }, "vendor")).toBe("Is 14 Feb free?");
  });
});
