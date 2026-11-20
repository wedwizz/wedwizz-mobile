import { describe, expect, it } from "vitest";
import type { Checklist, Favourite } from "../api/types";
import { isTempTask, withFavourite, withNewTask, withoutTask, withTaskPatch } from "./planner-cache";

const NOW = new Date("2026-10-31T04:30:00Z");
const fav = (slug: string): Favourite => ({ slug, savedAt: "2026-10-01T00:00:00.000Z", listing: null });

const checklist = (weddingDate: string | null = "2027-12-15"): Checklist => ({
  weddingDate,
  tasks: [
    { taskId: "a", title: "Book the venue", stage: "MONTHS_9", category: "Venue", dueDate: "2027-03-15", dueDateSet: false, done: false, doneAt: null, createdAt: "" },
    { taskId: "b", title: "Send invitations", stage: "MONTHS_3", category: "Guests", dueDate: "2027-08-01", dueDateSet: true, done: false, doneAt: null, createdAt: "" },
  ],
});

describe("optimistic favourites", () => {
  it("puts a new favourite first without a card, and keeps an existing one as it was", () => {
    const list = [fav("a"), fav("b")];
    expect(withFavourite(list, "c", true, NOW)).toEqual([{ slug: "c", savedAt: NOW.toISOString(), listing: null }, fav("a"), fav("b")]);
    expect(withFavourite(list, "b", true, NOW)).toEqual([fav("b"), fav("a")]);
    expect(withFavourite(list, "a", false)).toEqual([fav("b")]);
    expect(withFavourite(list, "zz", false)).toEqual(list);
  });
});

describe("optimistic checklist", () => {
  it("adds a task with a temporary id and its due date", () => {
    const next = withNewTask(checklist(), { title: "Book mehendi", stage: "MONTH_1", category: "Vendors", dueDate: null }, "1", NOW);
    expect(next.tasks[2]).toMatchObject({ taskId: "temp-1", dueDate: "2027-11-15", dueDateSet: false, done: false });
    expect(isTempTask(next.tasks[2])).toBe(true);
    expect(isTempTask(next.tasks[0])).toBe(false);
  });

  it("ticks off, edits and moves tasks, keeping or clearing the customer's own date", () => {
    expect(withTaskPatch(checklist(), "a", { done: true }, NOW).tasks[0]).toMatchObject({ done: true, doneAt: NOW.toISOString() });
    // A computed date follows a new stage.
    expect(withTaskPatch(checklist(), "a", { stage: "MONTHS_6" }).tasks[0]).toMatchObject({ dueDate: "2027-06-15", dueDateSet: false });
    // The customer's own date stays when the stage changes, and clearing it follows the wedding date again.
    expect(withTaskPatch(checklist(), "b", { stage: "MONTH_1" }).tasks[1]).toMatchObject({ dueDate: "2027-08-01", dueDateSet: true });
    expect(withTaskPatch(checklist(), "b", { dueDate: null }).tasks[1]).toMatchObject({ dueDate: "2027-09-15", dueDateSet: false });
    expect(withTaskPatch(checklist(null), "b", { dueDate: null }).tasks[1]).toMatchObject({ dueDate: null, dueDateSet: false });
    expect(withTaskPatch(checklist(), "b", { title: "Order invitations" }).tasks[1]).toMatchObject({ title: "Order invitations", category: "Guests" });
  });

  it("removes a task", () => {
    expect(withoutTask(checklist(), "a").tasks.map((t) => t.taskId)).toEqual(["b"]);
  });
});
