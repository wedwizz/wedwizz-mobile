import { describe, expect, it } from "vitest";
import { addMonths, formatDateLabel, parseDateKey, todayKey } from "./calendar";

describe("calendar helpers", () => {
  it("reads API date keys and rejects dates that don't exist", () => {
    expect(parseDateKey("2026-10-29")).toEqual({ year: 2026, month: 9, day: 29 });
    expect(parseDateKey("2026-02-30")).toBeNull();
    expect(parseDateKey("29/10/2026")).toBeNull();
    expect(parseDateKey("")).toBeNull();
  });

  it("shows a date as day, short month and year", () => {
    expect(formatDateLabel("2026-10-29")).toBe("29 Oct 2026");
    expect(formatDateLabel("2027-01-05")).toBe("5 Jan 2027");
  });

  it("gives today's key in local time", () => {
    expect(todayKey(new Date(2026, 0, 7, 23, 30))).toBe("2026-01-07");
  });

  it("moves across year ends", () => {
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths(2027, 0, -1)).toEqual({ year: 2026, month: 11 });
    expect(addMonths(2026, 5, 0)).toEqual({ year: 2026, month: 5 });
  });
});
