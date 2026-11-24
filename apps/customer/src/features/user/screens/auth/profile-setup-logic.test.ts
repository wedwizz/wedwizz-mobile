import { describe, expect, it } from "vitest";
import { emptyProfileForm, validateProfileForm } from "@/features/user/lib/customer-profile";
import {
  BUDGET_STOPS,
  GUEST_STOPS,
  ROLE_TILES,
  SETUP_STEPS,
  budgetSummary,
  firstStepWithError,
  guestSummary,
  phoneLabel,
  stepErrors,
  stopIndex,
  withoutEstimates,
} from "./profile-setup-logic";

describe("setup steps", () => {
  it("covers every field of the web form once", () => {
    const fields = SETUP_STEPS.flatMap((s) => s.fields).sort();
    expect(fields).toEqual(Object.keys(emptyProfileForm()).sort());
  });

  it("checks only the step on screen", () => {
    const errors = validateProfileForm(emptyProfileForm());
    expect(Object.keys(stepErrors(errors, 0)).sort()).toEqual(["name", "weddingRole"]);
    expect(Object.keys(stepErrors(errors, 1))).toEqual(["city"]);
    expect(stepErrors(errors, 2)).toEqual({});
  });

  it("goes back to the first step with a server error", () => {
    expect(firstStepWithError({ partnerName: "Too short" })).toBe(1);
    expect(firstStepWithError({ budgetRange: "Bad", email: "Bad" })).toBe(0);
    expect(firstStepWithError({})).toBeNull();
  });
});

describe("choices", () => {
  it("uses the web's roles with letter badges", () => {
    expect(ROLE_TILES.map((t) => `${t.letter}:${t.value}`)).toEqual(["B:BRIDE", "G:GROOM", "O:OTHER"]);
  });

  it("starts the estimates at not sure", () => {
    expect(GUEST_STOPS[0]).toBe("");
    expect(BUDGET_STOPS).toHaveLength(6);
    expect(stopIndex(GUEST_STOPS, "FROM_300_TO_500")).toBe(3);
    expect(guestSummary("")).toBe("Not sure yet");
    expect(guestSummary("FROM_100_TO_300")).toBe("100 – 300 guests");
    expect(budgetSummary("OVER_10L")).toBe("Above ₹10 lakh");
  });

  it("skips the estimates", () => {
    const form = { ...emptyProfileForm("Kochi"), guestRange: "UNDER_100" as const, budgetRange: "OVER_10L" as const };
    expect(withoutEstimates(form)).toMatchObject({ city: "Kochi", guestRange: "", budgetRange: "" });
  });
});

describe("phoneLabel", () => {
  it("groups an Indian number", () => {
    expect(phoneLabel("9876543021")).toBe("+91 98765 43021");
    expect(phoneLabel("+919876543021")).toBe("+91 98765 43021");
    expect(phoneLabel("12345")).toBe("12345");
  });
});
