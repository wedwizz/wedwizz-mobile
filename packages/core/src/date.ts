export type CalendarCell = number | null;

/** Formats y/m/d (month 0-indexed) into a "YYYY-MM-DD" lookup key. */
export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Builds a Monday-first month grid for the given year/month (0-indexed),
 * padded with `null` cells so every week has exactly 7 entries.
 */
export function getMonthGrid(year: number, month: number): CalendarCell[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // convert Sunday=0 -> Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
