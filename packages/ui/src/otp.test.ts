import { describe, expect, it } from "vitest";
import { enterOtpText, otpBackspaceFocus } from "./otp";

const empty = ["", "", "", "", "", ""];

describe("OTP boxes (web OtpInput behaviour)", () => {
  it("keeps one digit and moves to the next box", () => {
    expect(enterOtpText(empty, 0, "4", 6)).toEqual({ value: ["4", "", "", "", "", ""], focus: 1 });
  });

  it("stays on the last box", () => {
    expect(enterOtpText(["1", "2", "3", "4", "5", ""], 5, "6", 6)).toEqual({ value: ["1", "2", "3", "4", "5", "6"], focus: null });
  });

  it("ignores anything but digits", () => {
    expect(enterOtpText(empty, 2, "a", 6)).toEqual({ value: empty, focus: null });
  });

  it("replaces the digit when typing into a full box", () => {
    expect(enterOtpText(["1", "2", "", "", "", ""], 1, "27", 6)).toEqual({ value: ["1", "7", "", "", "", ""], focus: 2 });
  });

  it("clears a box", () => {
    expect(enterOtpText(["1", "2", "", "", "", ""], 1, "", 6)).toEqual({ value: ["1", "", "", "", "", ""], focus: null });
  });

  it("spreads a pasted or autofilled code over the boxes from the first", () => {
    expect(enterOtpText(empty, 0, "123456", 6)).toEqual({ value: ["1", "2", "3", "4", "5", "6"], focus: 5 });
    expect(enterOtpText(empty, 3, "12-34", 6)).toEqual({ value: ["1", "2", "3", "4", "", ""], focus: 4 });
    expect(enterOtpText(empty, 0, "12345678", 6).value).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("moves back on backspace only from an empty box", () => {
    expect(otpBackspaceFocus(["1", "", "", "", "", ""], 1)).toBe(0);
    expect(otpBackspaceFocus(["1", "2", "", "", "", ""], 1)).toBeNull();
    expect(otpBackspaceFocus(empty, 0)).toBeNull();
  });
});
