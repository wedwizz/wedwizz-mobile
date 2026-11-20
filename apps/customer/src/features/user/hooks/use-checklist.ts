import { useMutation, useQuery, useQueryClient, type QueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { createChecklistTask, deleteChecklistTask, getChecklist, updateChecklistTask } from "@/features/user/api/planner.api";
import { useAccountId } from "@/features/user/hooks/use-favourites";
import type { Checklist, ChecklistTaskPatch, NewChecklistTaskPayload } from "@wedwizz/core/api/types";
import { withNewTask, withoutTask, withTaskPatch } from "@wedwizz/core/planner/planner-cache";
import { checklistKeys } from "@wedwizz/core/query/query-keys";

/** The wedding checklist. Opening it the first time gives the customer the default tasks (on the server). */
export function useChecklist() {
  const accountId = useAccountId();
  return useQuery({
    queryKey: checklistKeys.account(accountId),
    queryFn: ({ signal }) => getChecklist({ signal }),
    enabled: !!accountId,
  });
}

/**
 * A checklist change shown at once: `apply` updates the cached checklist, a failure puts it back, and the
 * server's checklist replaces the guess once the last pending change settles.
 *
 * Changes share one scope, so their requests go one at a time in the order made: ticking then unticking a task
 * can't reach the server the other way round. Each still shows at once (onMutate isn't queued).
 */
export function checklistMutationOptions<T>(
  queryClient: QueryClient,
  accountId: string | null,
  mutationFn: (input: T) => Promise<unknown>,
  apply: (checklist: Checklist, input: T) => Checklist,
): UseMutationOptions<unknown, Error, T, { previous: Checklist | undefined }> {
  const key = checklistKeys.account(accountId);
  return {
    mutationKey: key,
    scope: { id: `checklist:${accountId}` },
    mutationFn,
    onMutate: async (input: T) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Checklist>(key);
      if (previous) queryClient.setQueryData<Checklist>(key, apply(previous, input));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    // A refetch while later changes wait would briefly bring back the server's older checklist.
    onSettled: () =>
      queryClient.isMutating({ mutationKey: key }) === 1
        ? queryClient.invalidateQueries({ queryKey: key })
        : undefined,
  };
}

function useOptimisticChecklist<T>(mutationFn: (input: T) => Promise<unknown>, apply: (checklist: Checklist, input: T) => Checklist) {
  return useMutation(checklistMutationOptions(useQueryClient(), useAccountId(), mutationFn, apply));
}

let tempIds = 0;

export function useAddChecklistTask() {
  return useOptimisticChecklist(
    (task: NewChecklistTaskPayload) => createChecklistTask(task),
    (checklist, task) => withNewTask(checklist, task, String(++tempIds)),
  );
}

export function useUpdateChecklistTask() {
  return useOptimisticChecklist(
    ({ taskId, patch }: { taskId: string; patch: ChecklistTaskPatch }) => updateChecklistTask(taskId, patch),
    (checklist, { taskId, patch }) => withTaskPatch(checklist, taskId, patch),
  );
}

export function useDeleteChecklistTask() {
  return useOptimisticChecklist(
    (taskId: string) => deleteChecklistTask(taskId),
    (checklist, taskId) => withoutTask(checklist, taskId),
  );
}
