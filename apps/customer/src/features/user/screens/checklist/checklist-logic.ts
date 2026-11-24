import type { ChecklistStage, ChecklistTask } from "@wedwizz/core/api/types";
import { CHECKLIST_STAGE_LABEL, CHECKLIST_STAGES } from "@wedwizz/core/planner/checklist-due";

/** Web checklist-page.tsx's decisions, kept out of the screen so they can be tested. */

export type StatusFilter = "all" | "pending" | "done";

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Completed" },
];

/** Total, completed and the rounded percentage done (0 with no tasks). */
export function checklistProgress(tasks: readonly ChecklistTask[]): { total: number; done: number; percent: number } {
  const done = tasks.filter((t) => t.done).length;
  return { total: tasks.length, done, percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
}

export interface StageGroup {
  stage: ChecklistStage;
  label: string;
  /** The tasks the filter shows. */
  tasks: ChecklistTask[];
  /** "3/7": over all of the stage's tasks, whatever the filter. */
  count: string;
}

/** The filtered tasks by planning stage, in stage order; stages with none shown are left out. */
export function stageGroups(tasks: readonly ChecklistTask[], filter: StatusFilter): StageGroup[] {
  const shown = tasks.filter((t) => filter === "all" || (filter === "done" ? t.done : !t.done));
  return CHECKLIST_STAGES.flatMap((stage) => {
    const items = shown.filter((t) => t.stage === stage);
    if (items.length === 0) return [];
    const all = tasks.filter((t) => t.stage === stage);
    return [{ stage, label: CHECKLIST_STAGE_LABEL[stage], tasks: items, count: `${all.filter((t) => t.done).length}/${all.length}` }];
  });
}

export const emptyBody = (filter: StatusFilter): string =>
  filter === "done" ? "Complete a task and it will appear here." : "Add a task to get started.";

/** "Due 12 Mar 2027", or null without a due date. */
export function dueLabel(dueDate: string | null): string | null {
  if (!dueDate) return null;
  return `Due ${new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

/** The task form's only check (web TaskFormSheet). */
export const taskTitleError = (title: string): string => (title.trim().length < 2 ? "Give the task a short title." : "");
