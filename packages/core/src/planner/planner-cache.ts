import type { Checklist, ChecklistTask, ChecklistTaskPatch, Favourite, NewChecklistTaskPayload } from "../api/types";
import { effectiveDueDate } from "./checklist-due";

/**
 * Plain TS (shared with the mobile app): how an optimistic update changes the cached favourites and
 * checklist before the server answers. The server's answer replaces them once it arrives.
 */

/** Saved (newest first) or removed. A new one has no card until the list is reloaded. */
export function withFavourite(favourites: Favourite[], slug: string, saved: boolean, now: Date = new Date()): Favourite[] {
  const others = favourites.filter((f) => f.slug !== slug);
  if (!saved) return others;
  const existing = favourites.find((f) => f.slug === slug);
  return [existing ?? { slug, savedAt: now.toISOString(), listing: null }, ...others];
}

const TEMP_PREFIX = "temp-";

/** A task not saved yet: it cannot be edited until the server gives it its id. */
export function isTempTask(task: Pick<ChecklistTask, "taskId">): boolean {
  return task.taskId.startsWith(TEMP_PREFIX);
}

export function withNewTask(checklist: Checklist, task: NewChecklistTaskPayload, tempId: string, now: Date = new Date()): Checklist {
  const added: ChecklistTask = {
    taskId: `${TEMP_PREFIX}${tempId}`,
    title: task.title,
    stage: task.stage,
    category: task.category,
    dueDate: effectiveDueDate(task.stage, task.dueDate, checklist.weddingDate),
    dueDateSet: task.dueDate !== null,
    done: false,
    doneAt: null,
    createdAt: now.toISOString(),
  };
  return { ...checklist, tasks: [...checklist.tasks, added] };
}

export function withTaskPatch(checklist: Checklist, taskId: string, patch: ChecklistTaskPatch, now: Date = new Date()): Checklist {
  return {
    ...checklist,
    tasks: checklist.tasks.map((task) => {
      if (task.taskId !== taskId) return task;
      const stage = patch.stage ?? task.stage;
      // The date the customer set: changed by the patch, or kept (only when they had set one).
      const ownDate = patch.dueDate !== undefined ? patch.dueDate : task.dueDateSet ? task.dueDate : null;
      return {
        ...task,
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
        stage,
        dueDate: effectiveDueDate(stage, ownDate, checklist.weddingDate),
        dueDateSet: ownDate !== null,
        ...(patch.done !== undefined ? { done: patch.done, doneAt: patch.done ? now.toISOString() : null } : {}),
      };
    }),
  };
}

export function withoutTask(checklist: Checklist, taskId: string): Checklist {
  return { ...checklist, tasks: checklist.tasks.filter((task) => task.taskId !== taskId) };
}
