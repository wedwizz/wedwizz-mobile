import type { StatsDay, StatsRange, StatsTotals } from "../api/types";
import { formatINR } from "../format";

/** Plain TS for the vendor's dashboards (and later the mobile app): stats as the cards and charts show them. */

/** Shown while a number is loading or doesn't exist yet. */
export const NO_STAT = "—";

export const STATS_RANGE_LABEL: Record<StatsRange, string> = { "30d": "30 Days", "90d": "90 Days" };

export function formatCount(value: number | undefined): string {
  return value === undefined ? NO_STAT : value.toLocaleString("en-IN");
}

/** "75%"; a dash without leads. */
export function formatAcceptRate(rate: number | null | undefined): string {
  return rate === null || rate === undefined ? NO_STAT : `${Math.round(rate * 100)}%`;
}

/** "Under 1 min", "25 min", "3 h", "2 d"; a dash when no lead was answered in the chat. */
export function formatResponseTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return NO_STAT;
  if (seconds < 60) return "Under 1 min";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)} h`;
  return `${Math.round(seconds / 86_400)} d`;
}

/** "₹2,40,000"; a dash when no booking has an amount the vendor entered. */
export function formatReportedRevenue(revenue: StatsTotals["reportedRevenue"] | undefined): string {
  return !revenue || revenue.bookings === 0 ? NO_STAT : formatINR(revenue.amount);
}

/** "4.5"; a dash without reviews. */
export function formatRating(rating: StatsTotals["rating"] | undefined): string {
  return !rating || rating.average === null ? NO_STAT : rating.average.toFixed(1);
}

/** Each day's bar as a percentage of the highest day (all zero when nothing happened). */
export function seriesBars(series: readonly StatsDay[], key: "views" | "enquiries" | "bookings"): number[] {
  const max = Math.max(0, ...series.map((day) => day[key]));
  return series.map((day) => (max === 0 ? 0 : Math.round((day[key] / max) * 100)));
}

/** "1 Oct" for a "YYYY-MM-DD" date. */
export function shortDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}
