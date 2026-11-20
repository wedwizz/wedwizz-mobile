import type { ChecklistStage } from "../api/types";

/**
 * Plain TS (shared with the mobile app). The same rule as the server's domain/entity/checklist.ts, so an
 * optimistic edit shows the date the server will return. Keep the two in step; both are tested on the same cases.
 */

export const CHECKLIST_STAGES: readonly ChecklistStage[] = ["MONTHS_12", "MONTHS_9", "MONTHS_6", "MONTHS_3", "MONTH_1", "WEDDING_WEEK"];

export const CHECKLIST_STAGE_LABEL: Record<ChecklistStage, string> = {
  MONTHS_12: "12 months before",
  MONTHS_9: "9 months before",
  MONTHS_6: "6 months before",
  MONTHS_3: "3 months before",
  MONTH_1: "1 month before",
  WEDDING_WEEK: "Wedding week",
};

const STAGE_OFFSET: Record<ChecklistStage, { months: number } | { days: number }> = {
  MONTHS_12: { months: 12 },
  MONTHS_9: { months: 9 },
  MONTHS_6: { months: 6 },
  MONTHS_3: { months: 3 },
  MONTH_1: { months: 1 },
  WEDDING_WEEK: { days: 7 },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** The due date of a stage for a wedding on "YYYY-MM-DD"; months clamp to the month's last day. */
export function stageDueDate(stage: ChecklistStage, weddingDate: string): string {
  const [year, month, day] = weddingDate.split("-").map(Number);
  const offset = STAGE_OFFSET[stage];
  if ("days" in offset) return new Date(Date.UTC(year, month - 1, day - offset.days)).toISOString().slice(0, 10);
  const months = year * 12 + (month - 1) - offset.months;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return `${y}-${pad(m + 1)}-${pad(Math.min(day, lastDay))}`;
}

/** The customer's own date first, then the stage's date before the wedding, else none. */
export function effectiveDueDate(stage: ChecklistStage, ownDate: string | null, weddingDate: string | null): string | null {
  if (ownDate) return ownDate;
  return weddingDate ? stageDueDate(stage, weddingDate) : null;
}
