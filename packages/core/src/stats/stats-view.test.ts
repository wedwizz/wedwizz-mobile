import { describe, expect, it } from "vitest";
import {
  formatAcceptRate,
  formatCount,
  formatRating,
  formatReportedRevenue,
  formatResponseTime,
  seriesBars,
  shortDate,
} from "./stats-view";

describe("stats view", () => {
  it("shows counts the Indian way, and a dash while loading", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(125000)).toBe("1,25,000");
    expect(formatCount(undefined)).toBe("—");
  });

  it("shows the accept rate as a whole percentage, and a dash without leads", () => {
    expect(formatAcceptRate(0.75)).toBe("75%");
    expect(formatAcceptRate(0.667)).toBe("67%");
    expect(formatAcceptRate(0)).toBe("0%");
    expect(formatAcceptRate(null)).toBe("—");
  });

  it("puts the median reply time in minutes, hours or days", () => {
    expect(formatResponseTime(20)).toBe("Under 1 min");
    expect(formatResponseTime(1500)).toBe("25 min");
    expect(formatResponseTime(3 * 3600 + 600)).toBe("3 h");
    expect(formatResponseTime(2 * 86_400)).toBe("2 d");
    expect(formatResponseTime(null)).toBe("—");
  });

  it("shows reported revenue only when a booking has a vendor-entered amount", () => {
    expect(formatReportedRevenue({ amount: 240000, bookings: 2 })).toBe("₹2,40,000");
    expect(formatReportedRevenue({ amount: 0, bookings: 0 })).toBe("—");
    expect(formatReportedRevenue(undefined)).toBe("—");
  });

  it("shows the rating to one decimal, and a dash without reviews", () => {
    expect(formatRating({ average: 4.5, count: 2 })).toBe("4.5");
    expect(formatRating({ average: 4, count: 1 })).toBe("4.0");
    expect(formatRating({ average: null, count: 0 })).toBe("—");
  });

  it("scales each day's bar to the busiest day", () => {
    const day = (views: number) => ({ date: "2026-10-01", views, enquiries: 0, bookings: 0 });
    expect(seriesBars([day(2), day(4), day(0), day(1)], "views")).toEqual([50, 100, 0, 25]);
    expect(seriesBars([day(0), day(0)], "views")).toEqual([0, 0]);
    expect(seriesBars([], "views")).toEqual([]);
  });

  it("labels a chart's dates briefly", () => {
    expect(shortDate("2026-10-01")).toBe("1 Oct");
    expect(shortDate("2026-12-31")).toBe("31 Dec");
  });
});
