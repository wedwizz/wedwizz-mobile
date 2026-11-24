import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ListChecks, Plus } from "lucide-react-native";
import { AppText, Button, Card, ChipGroup, CountRow, Divider, EmptyState, ErrorState, InlineLink, LoadingState, Notice, ProgressBar, Screen, TaskRow, space } from "@wedwizz/ui";
import { STATUS_FILTERS, type StatusFilter } from "./checklist-logic";

export interface ChecklistTaskRow {
  key: string;
  title: string;
  category: string;
  due: string | null;
  done: boolean;
  editable: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface ChecklistContent {
  /** Without a wedding date: "Add your wedding date…" with a link to the profile. */
  onAddWeddingDate: (() => void) | null;
  error: string;
  progress: { total: number; done: number; percent: number };
  filter: StatusFilter;
  onFilter: (filter: StatusFilter) => void;
  groups: { key: string; label: string; count: string; tasks: ChecklistTaskRow[] }[];
  emptyBody: string;
}

export interface ChecklistViewProps {
  onAdd: () => void;
  state: { kind: "loading" } | { kind: "error"; onRetry: () => void } | { kind: "ready"; content: ChecklistContent };
  refreshing: boolean;
  onRefresh: () => void;
  /** The add / edit task sheet. */
  sheet: ReactNode;
}

/** Web checklist-page.tsx: title with "Add task", progress, the status filter, tasks by planning stage. */
export function ChecklistView({ onAdd, state, refreshing, onRefresh, sheet }: ChecklistViewProps) {
  return (
    <Screen refreshing={refreshing} onRefresh={state.kind === "ready" ? onRefresh : undefined}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <AppText variant="title" accessibilityRole="header">
            Wedding Checklist
          </AppText>
          <AppText variant="meta" color="muted">
            Plan step by step, stage by stage.
          </AppText>
        </View>
        <Button label="Add task" size="sm" iconLeft={Plus} onPress={onAdd} />
      </View>

      {state.kind === "loading" && <LoadingState cards={3} />}
      {state.kind === "error" && <ErrorState onRetry={state.onRetry} />}
      {state.kind === "ready" && <Ready c={state.content} onAdd={onAdd} />}
      {sheet}
    </Screen>
  );
}

function Ready({ c, onAdd }: { c: ChecklistContent; onAdd: () => void }) {
  return (
    <View style={styles.body}>
      {c.onAddWeddingDate && (
        <Notice>
          <AppText variant="meta" color="muted">
            Add your wedding date to see when each task is due. <InlineLink label="Add wedding date" color="brand" onPress={c.onAddWeddingDate} />
          </AppText>
        </Notice>
      )}
      {c.error !== "" && (
        <AppText variant="label" color="danger" accessibilityRole="alert">
          {c.error}
        </AppText>
      )}

      <Card>
        <View accessibilityLabel="Progress" style={styles.progress}>
          <CountRow
            items={[
              { value: String(c.progress.total), label: "Total tasks" },
              { value: String(c.progress.done), label: "Completed", color: "ok" },
              { value: `${c.progress.percent}%`, label: "Progress", color: "brand" },
            ]}
          />
          <ProgressBar value={c.progress.percent} label="Checklist progress" />
        </View>
      </Card>

      <ChipGroup accessibilityLabel="Filter tasks" options={STATUS_FILTERS} value={c.filter} onChange={c.onFilter} />

      {c.groups.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks here" body={c.emptyBody} actionLabel="Add task" onAction={onAdd} />
      ) : (
        c.groups.map((group) => (
          <Card key={group.key} padding={0}>
            <View style={styles.group}>
              <View style={styles.groupHead}>
                <AppText variant="cardTitle" accessibilityRole="header" style={styles.flex}>
                  {group.label}
                </AppText>
                <AppText variant="label" color="muted">
                  {group.count}
                </AppText>
              </View>
              {group.tasks.map((task, i) => (
                <View key={task.key}>
                  {i > 0 && <Divider />}
                  <TaskRow {...task} />
                </View>
              ))}
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", gap: space.md, paddingTop: space.lg, marginBottom: space.lg },
  titles: { flex: 1, gap: space.xs },
  body: { gap: space.lg, paddingBottom: space.xxl },
  progress: { gap: space.md },
  group: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xs },
  groupHead: { flexDirection: "row", alignItems: "center", gap: space.sm },
  flex: { flex: 1 },
});
