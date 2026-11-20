import { describe, expect, it } from "vitest";
import { CHECKLIST_STAGES, effectiveDueDate, stageDueDate } from "./checklist-due";

// The same cases as the server's tests/unit/planner/checklist-rules.test.ts.
describe("checklist due dates", () => {
  it("counts each stage back from the wedding date", () => {
    expect(CHECKLIST_STAGES.map((stage) => stageDueDate(stage, "2027-12-15"))).toEqual([
      "2026-12-15",
      "2027-03-15",
      "2027-06-15",
      "2027-09-15",
      "2027-11-15",
      "2027-12-08",
    ]);
  });

  it("clamps to the end of a shorter month, leap years included", () => {
    expect(stageDueDate("MONTH_1", "2027-03-31")).toBe("2027-02-28");
    expect(stageDueDate("MONTH_1", "2028-03-31")).toBe("2028-02-29");
    expect(stageDueDate("MONTHS_3", "2027-05-31")).toBe("2027-02-28");
    expect(stageDueDate("MONTHS_6", "2027-08-31")).toBe("2027-02-28");
    expect(stageDueDate("WEDDING_WEEK", "2027-01-03")).toBe("2026-12-27");
    expect(stageDueDate("MONTHS_12", "2028-02-29")).toBe("2027-02-28");
  });

  it("uses the customer's own date first, then the wedding date, else none", () => {
    expect(effectiveDueDate("MONTHS_6", "2027-01-01", "2027-12-15")).toBe("2027-01-01");
    expect(effectiveDueDate("MONTHS_6", null, "2027-12-15")).toBe("2027-06-15");
    expect(effectiveDueDate("MONTHS_6", null, null)).toBeNull();
  });
});
