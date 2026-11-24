import { describe, expect, it } from "vitest";
import { afterVerify } from "./intro-logic";

describe("afterVerify", () => {
  it("shows the intro to a new account, keeping where they came from", () => {
    expect(afterVerify(true, "/user/vendors/lumen-stories-kochi")).toEqual({
      pathname: "/user/onboarding",
      params: { from: "/user/vendors/lumen-stories-kochi" },
    });
    expect(afterVerify(true, undefined)).toEqual({ pathname: "/user/onboarding", params: {} });
  });

  it("sends a returning account back to its page", () => {
    expect(afterVerify(false, "/user/vendors/lumen-stories-kochi")).toBe("/user/vendors/lumen-stories-kochi");
    expect(afterVerify(false, undefined)).toBe("/user/home");
  });
});
