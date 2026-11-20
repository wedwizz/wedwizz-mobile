import { describe, expect, it, vi } from "vitest";
import { currentPath } from "./current-path";

vi.mock("expo-router", () => ({}));

describe("current page (path and search)", () => {
  it("is the path alone without search params", () => {
    expect(currentPath("/user/home", ["user", "(tabs)", "home"], {})).toBe("/user/home");
  });

  it("leaves out dynamic segments, which are already in the path, and keeps the rest as the search", () => {
    expect(currentPath("/user/vendors/lumen-stories-kochi", ["user", "vendors", "[slug]"], { slug: "lumen-stories-kochi", photo: "2" })).toBe(
      "/user/vendors/lumen-stories-kochi?photo=2",
    );
    expect(currentPath("/user/a/b", ["user", "[...rest]"], { rest: ["a", "b"] })).toBe("/user/a/b");
  });

  it("gives the same string for the same page, whatever the param order", () => {
    const a = currentPath("/user/vendors", ["user", "(tabs)", "vendors"], { sort: "price", category: "photographers" });
    const b = currentPath("/user/vendors", ["user", "(tabs)", "vendors"], { category: "photographers", sort: "price" });
    expect(a).toBe("/user/vendors?category=photographers&sort=price");
    expect(b).toBe(a);
  });

  it("encodes values and repeats list params", () => {
    expect(currentPath("/user/vendors", [], { q: "a&b c", tag: ["x", "y"] })).toBe("/user/vendors?q=a%26b%20c&tag=x&tag=y");
  });
});
