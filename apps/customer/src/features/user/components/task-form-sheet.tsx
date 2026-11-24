import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, DateField, SelectField, Sheet, TextField, space } from "@wedwizz/ui";
import type { ChecklistStage, ChecklistTask, NewChecklistTaskPayload } from "@wedwizz/core/api/types";
import { CHECKLIST_STAGE_LABEL, CHECKLIST_STAGES } from "@wedwizz/core/planner/checklist-due";
import { CHECKLIST_CATEGORIES } from "@/features/user/data/planner";
import { taskTitleError } from "@/features/user/screens/checklist/checklist-logic";

const STAGE_OPTIONS = CHECKLIST_STAGES.map((s) => ({ value: s, label: CHECKLIST_STAGE_LABEL[s] }));
const CATEGORY_OPTIONS = CHECKLIST_CATEGORIES.map((c) => ({ value: c as string, label: c }));

interface TaskFormSheetProps {
  visible: boolean;
  /** When set, the sheet edits this task; otherwise it adds a new one. */
  task: ChecklistTask | null;
  /** Without one, a task's due date is only the one set here. */
  hasWeddingDate: boolean;
  onClose: () => void;
  onSave: (draft: NewChecklistTaskPayload) => void;
}

/** "Add task" / "Edit task" (web TaskFormSheet). */
export function TaskFormSheet({ visible, task, hasWeddingDate, onClose, onSave }: TaskFormSheetProps) {
  return (
    <Sheet visible={visible} title={task ? "Edit task" : "Add task"} onClose={onClose} scroll>
      {visible && <Form key={task?.taskId ?? "new"} task={task} hasWeddingDate={hasWeddingDate} onSave={onSave} />}
    </Sheet>
  );
}

function Form({ task, hasWeddingDate, onSave }: { task: ChecklistTask | null; hasWeddingDate: boolean; onSave: (draft: NewChecklistTaskPayload) => void }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [stage, setStage] = useState<ChecklistStage>(task?.stage ?? CHECKLIST_STAGES[0]);
  const [category, setCategory] = useState<string>(task?.category ?? CHECKLIST_CATEGORIES[0]);
  // Only a date the customer set; a computed one follows the wedding date and is not edited here.
  const [dueDate, setDueDate] = useState(task?.dueDateSet ? (task.dueDate ?? "") : "");
  const [error, setError] = useState("");

  const submit = () => {
    const problem = taskTitleError(title);
    if (problem) return setError(problem);
    onSave({ title: title.trim(), stage, category, dueDate: dueDate || null });
  };

  return (
    <View style={styles.form}>
      <TextField
        label="Task"
        required
        value={title}
        error={error || undefined}
        maxLength={120}
        onChangeText={(v) => {
          setTitle(v);
          setError("");
        }}
        placeholder="e.g. Book the caterer"
        autoCapitalize="sentences"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <SelectField label="Planning stage" options={STAGE_OPTIONS} value={stage} onChange={setStage} placeholder="Choose a stage" />
      <SelectField label="Category" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} placeholder="Choose a category" />
      <DateField label="Due date" note={hasWeddingDate ? "optional; leave empty to follow your wedding date" : "optional"} value={dueDate} onChange={setDueDate} />
      <Button label={task ? "Save changes" : "Add task"} onPress={submit} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.lg, paddingBottom: space.sm },
});
