import { describe, expect, it } from "vitest";
import type { ChecklistTask } from "@wedwizz/core/api/types";
import { checklistProgress, dueLabel, emptyBody, stageGroups, taskTitleError } from "./checklist-logic";

const task = (taskId: string, stage: ChecklistTask["stage"], done: boolean): ChecklistTask => ({
  taskId,
  title: `Task ${taskId}`,
  stage,
  category: "Venue",
  dueDate: null,
  dueDateSet: false,
  done,
  doneAt: null,
  createdAt: "2026-11-01T00:00:00.000Z",
});

const tasks = [task("a", "MONTHS_6", true), task("b", "MONTHS_12", false), task("c", "MONTHS_6", false), task("d", "WEDDING_WEEK", true)];

describe("checklistProgress", () => {
  it("counts done tasks and rounds the percentage", () => {
    expect(checklistProgress(tasks)).toEqual({ total: 4, done: 2, percent: 50 });
    expect(checklistProgress([task("x", "MONTH_1", true), task("y", "MONTH_1", false), task("z", "MONTH_1", false)]).percent).toBe(33);
  });

  it("is 0% with no tasks", () => {
    expect(checklistProgress([])).toEqual({ total: 0, done: 0, percent: 0 });
  });
});

describe("stageGroups", () => {
  it("groups in stage order and counts each stage over all its tasks", () => {
    const groups = stageGroups(tasks, "all");
    expect(groups.map((g) => g.stage)).toEqual(["MONTHS_12", "MONTHS_6", "WEDDING_WEEK"]);
    expect(groups[1]).toMatchObject({ count: "1/2", tasks: [{ taskId: "a" }, { taskId: "c" }] });
  });

  it("filters pending and completed, leaving out stages with none shown", () => {
    expect(stageGroups(tasks, "pending").flatMap((g) => g.tasks.map((t) => t.taskId))).toEqual(["b", "c"]);
    const done = stageGroups(tasks, "done");
    expect(done.map((g) => g.stage)).toEqual(["MONTHS_6", "WEDDING_WEEK"]);
    expect(done[0].count).toBe("1/2");
  });
});

describe("texts", () => {
  it("explains an empty filter", () => {
    expect(emptyBody("done")).toBe("Complete a task and it will appear here.");
    expect(emptyBody("pending")).toBe("Add a task to get started.");
  });

  it("labels the due date", () => {
    expect(dueLabel(null)).toBeNull();
    expect(dueLabel("2027-03-12")).toMatch(/^Due .*2027$/);
  });

  it("needs a title of 2 characters", () => {
    expect(taskTitleError(" a ")).toBe("Give the task a short title.");
    expect(taskTitleError("Book")).toBe("");
  });
});
