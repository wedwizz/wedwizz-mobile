import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { toApiError } from "@wedwizz/core/api/api-error";
import type { ChecklistTask, NewChecklistTaskPayload } from "@wedwizz/core/api/types";
import { isTempTask } from "@wedwizz/core/planner/planner-cache";
import { TaskFormSheet } from "@/features/user/components/task-form-sheet";
import { useAddChecklistTask, useChecklist, useDeleteChecklistTask, useUpdateChecklistTask } from "@/features/user/hooks/use-checklist";
import { RequireUser } from "@/features/user/routes/guards";
import { checklistProgress, dueLabel, emptyBody, stageGroups, type StatusFilter } from "./checklist-logic";
import { ChecklistView, type ChecklistContent } from "./checklist-view";

/** Web checklist-page.tsx, the Checklist tab. Customers only. */
export function ChecklistScreen() {
  return (
    <RequireUser inLayout>
      <Checklist />
    </RequireUser>
  );
}

function Checklist() {
  const router = useRouter();
  const query = useChecklist();
  const add = useAddChecklistTask();
  const update = useUpdateChecklistTask();
  const remove = useDeleteChecklistTask();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ChecklistTask | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  // Changes show at once; a failed one is put back and explained here.
  const onError = (err: unknown) => setError(toApiError(err).message);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const save = (draft: NewChecklistTaskPayload) => {
    setError("");
    if (editing) update.mutate({ taskId: editing.taskId, patch: draft }, { onError });
    else add.mutate(draft, { onError });
    setFormOpen(false);
  };
  // Web: a "Delete this task?" sheet. Here: the phone's dialog.
  const confirmDelete = (task: ChecklistTask) =>
    Alert.alert("Delete this task?", `"${task.title}" will be removed from your checklist.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setError("");
          remove.mutate(task.taskId, { onError });
        },
      },
    ]);

  const sheet = (
    <TaskFormSheet visible={formOpen} task={editing} hasWeddingDate={!!query.data?.weddingDate} onClose={() => setFormOpen(false)} onSave={save} />
  );
  const refresh = () => {
    setRefreshing(true);
    void query.refetch().finally(() => setRefreshing(false));
  };

  if (query.isPending) return <ChecklistView onAdd={openAdd} state={{ kind: "loading" }} refreshing={false} onRefresh={refresh} sheet={sheet} />;
  // Only when nothing loaded: a failed background refresh keeps the checklist on screen.
  if (!query.data) {
    return <ChecklistView onAdd={openAdd} state={{ kind: "error", onRetry: () => void query.refetch() }} refreshing={false} onRefresh={refresh} sheet={sheet} />;
  }

  const { tasks, weddingDate } = query.data;
  const content: ChecklistContent = {
    // Web: a link to the profile page, where the wedding date is edited.
    onAddWeddingDate: weddingDate ? null : () => router.navigate("/user/profile"),
    error,
    progress: checklistProgress(tasks),
    filter,
    onFilter: setFilter,
    emptyBody: emptyBody(filter),
    groups: stageGroups(tasks, filter).map((group) => ({
      key: group.stage,
      label: group.label,
      count: group.count,
      tasks: group.tasks.map((t) => ({
        key: t.taskId,
        title: t.title,
        category: t.category,
        due: dueLabel(t.dueDate),
        done: t.done,
        editable: !isTempTask(t),
        onToggle: () => {
          setError("");
          update.mutate({ taskId: t.taskId, patch: { done: !t.done } }, { onError });
        },
        onEdit: () => {
          setEditing(t);
          setFormOpen(true);
        },
        onDelete: () => confirmDelete(t),
      })),
    })),
  };

  return <ChecklistView onAdd={openAdd} state={{ kind: "ready", content }} refreshing={refreshing} onRefresh={refresh} sheet={sheet} />;
}
