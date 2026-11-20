import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHAT_POLL_INTERVALS, createPollingChatUpdates } from "./chat-updates";

describe("polling chat updates", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("polls a thread every 10 s and the inbox every 60 s, until unsubscribed", () => {
    const updates = createPollingChatUpdates(CHAT_POLL_INTERVALS);
    const thread = vi.fn();
    const inbox = vi.fn();
    const stopThread = updates.watchThread("e1", thread);
    const stopInbox = updates.watchInbox(inbox);

    vi.advanceTimersByTime(59_999);
    expect(thread).toHaveBeenCalledTimes(5);
    expect(inbox).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(thread).toHaveBeenCalledTimes(6);
    expect(inbox).toHaveBeenCalledTimes(1);

    stopThread();
    stopInbox();
    vi.advanceTimersByTime(120_000);
    expect(thread).toHaveBeenCalledTimes(6);
    expect(inbox).toHaveBeenCalledTimes(1);
  });

  it("skips polls while paused (a hidden tab)", () => {
    let hidden = true;
    const updates = createPollingChatUpdates({ threadMs: 1000, inboxMs: 1000, isPaused: () => hidden });
    const onChange = vi.fn();
    updates.watchThread("e1", onChange);

    vi.advanceTimersByTime(3000);
    expect(onChange).not.toHaveBeenCalled();
    hidden = false;
    vi.advanceTimersByTime(1000);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
