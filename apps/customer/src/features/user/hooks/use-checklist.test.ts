import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { checklistMutationOptions } from "@/features/user/hooks/use-checklist";
import type { Checklist, ChecklistTaskPatch } from "@wedwizz/core/api/types";
import { withTaskPatch } from "@wedwizz/core/planner/planner-cache";
import { checklistKeys } from "@wedwizz/core/query/query-keys";

const checklist: Checklist = {
  weddingDate: null,
  tasks: [{ taskId: "a", title: "Book the venue", stage: "MONTHS_9", category: "Venue", dueDate: null, dueDateSet: false, done: false, doneAt: null, createdAt: "" }],
};

const ACCOUNT = "acc-anjali";
type Update = { taskId: string; patch: ChecklistTaskPatch };

// Requests the test finishes by hand, to see which ones are on their way to the server.
function setup() {
  const queryClient = new QueryClient();
  queryClient.setQueryData(checklistKeys.account(ACCOUNT), checklist);
  const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();
  const sent: { input: Update; finish: () => void }[] = [];
  const mutationFn = (input: Update) => new Promise<void>((resolve) => sent.push({ input, finish: resolve }));
  const options = checklistMutationOptions(queryClient, ACCOUNT, mutationFn, (c, { taskId, patch }: Update) => withTaskPatch(c, taskId, patch));
  const change = (patch: ChecklistTaskPatch) => new MutationObserver(queryClient, options).mutate({ taskId: "a", patch });
  const done = () => queryClient.getQueryData<Checklist>(checklistKeys.account(ACCOUNT))?.tasks[0].done;
  return { invalidate, sent, change, done };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("checklist changes", () => {
  it("show at once but reach the server one at a time, in the order made", async () => {
    const { invalidate, sent, change, done } = setup();
    const tick = change({ done: true });
    const untick = change({ done: false });
    await flush();

    expect(done()).toBe(false);
    expect(sent.map((s) => s.input.patch)).toEqual([{ done: true }]);

    sent[0].finish();
    await tick;
    await flush();
    expect(sent.map((s) => s.input.patch)).toEqual([{ done: true }, { done: false }]);
    // The untick is still on its way, so the checklist isn't refetched yet.
    expect(invalidate).not.toHaveBeenCalled();
    expect(done()).toBe(false);

    sent[1].finish();
    await untick;
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});
