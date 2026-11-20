import { describe, expect, it } from "vitest";
import { returnPath } from "@/features/user/lib/return-path";

describe("returnPath", () => {
  it("returns to the customer page that asked for sign-in", () => {
    expect(returnPath("/user/venues/lake-view-kochi")).toBe("/user/venues/lake-view-kochi");
    expect(returnPath("/user/vendors?category=photographers")).toBe("/user/vendors?category=photographers");
  });

  it("goes home for anything else", () => {
    for (const from of [undefined, null, 42, "", "/vendor/leads", "https://evil.example/user/", "//evil.example", "/user\\..\\x", "/user/login", "/user/verify-otp", "/user/welcome"]) {
      expect(returnPath(from)).toBe("/user/home");
    }
  });
});
