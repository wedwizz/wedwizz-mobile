import { describe, expect, it } from "vitest";
import {
  BUDGET_RANGE_OPTIONS,
  budgetRangeLabel,
  emptyProfileForm,
  guestRangeLabel,
  profileRedirect,
  serverFieldErrors,
  toProfileForm,
  toSaveRequest,
  validateProfileForm,
  weddingRoleLabel,
} from "./customer-profile";
import type { CustomerProfile } from "@wedwizz/core/api/types";

const PROFILE: CustomerProfile = {
  name: "Anjali Menon",
  weddingRole: "BRIDE",
  email: null,
  city: "Kochi",
  weddingDate: "2027-02-14",
  partnerName: "Rahul",
  guestRange: "FROM_300_TO_500",
  budgetRange: null,
  updatedAt: "2026-10-28T00:00:00.000Z",
};

describe("profileRedirect", () => {
  it("sends a customer without a profile to setup, from anywhere", () => {
    expect(profileRedirect("/user/home", false)).toBe("/user/profile-setup");
    expect(profileRedirect("/user/vendors/lumen-stories-kochi", false)).toBe("/user/profile-setup");
    expect(profileRedirect("/user/profile-setup", false)).toBeNull();
    expect(profileRedirect("/user/profile-setup/", false)).toBeNull();
    expect(profileRedirect("/user/profile", false)).toBe("/user/profile-setup");
  });

  it("lets a customer read the privacy policy and terms before setup", () => {
    expect(profileRedirect("/user/profile/privacy", false)).toBeNull();
    expect(profileRedirect("/user/onboarding", false)).toBeNull();
    expect(profileRedirect("/user/profile/terms", false)).toBeNull();
    expect(profileRedirect("/user/profile/notifications", false)).toBe("/user/profile-setup");
  });

  it("keeps a customer with a profile out of setup and lets every other page through", () => {
    expect(profileRedirect("/user/profile-setup", true)).toBe("/user/home");
    expect(profileRedirect("/user/home", true)).toBeNull();
    expect(profileRedirect("/user/profile", true)).toBeNull();
  });
});

describe("profile form", () => {
  it("turns a saved profile into inputs and back, sending empty fields as null", () => {
    const form = toProfileForm(PROFILE);
    expect(form).toEqual({ name: "Anjali Menon", weddingRole: "BRIDE", email: "", city: "Kochi", weddingDate: "2027-02-14", partnerName: "Rahul", guestRange: "FROM_300_TO_500", budgetRange: "" });
    expect(toSaveRequest({ ...form, name: "  Anjali  ", partnerName: "   " })).toEqual({
      name: "Anjali",
      weddingRole: "BRIDE",
      email: null,
      city: "Kochi",
      weddingDate: "2027-02-14",
      partnerName: null,
      guestRange: "FROM_300_TO_500",
      budgetRange: null,
    });
  });

  it("checks the required fields and formats before saving", () => {
    expect(validateProfileForm(emptyProfileForm())).toEqual({ name: expect.any(String), weddingRole: expect.any(String), city: expect.any(String) });
    expect(validateProfileForm({ ...toProfileForm(PROFILE), weddingRole: "" })).toEqual({ weddingRole: expect.any(String) });
    expect(weddingRoleLabel("OTHER")).toBe("Other");
    expect(validateProfileForm({ ...toProfileForm(PROFILE), email: "anjali@", partnerName: "R" })).toEqual({
      email: expect.any(String),
      partnerName: expect.any(String),
    });
    expect(validateProfileForm(toProfileForm(PROFILE))).toEqual({});
  });

  it("puts the server's field issues on the matching inputs", () => {
    expect(
      serverFieldErrors({
        issues: [
          { field: "weddingDate", message: "The wedding date cannot be in the past" },
          { field: "phoneNumber", message: "ignored" },
        ],
      }),
    ).toEqual({ weddingDate: "The wedding date cannot be in the past" });
    expect(serverFieldErrors(undefined)).toEqual({});
  });

  it("labels the ranges, matching the enquiry budget wording", () => {
    expect(guestRangeLabel("FROM_300_TO_500")).toBe("300 – 500");
    expect(budgetRangeLabel(null)).toBe("Not set");
    expect(BUDGET_RANGE_OPTIONS.map((o) => o.label)).toEqual(["Under ₹1 lakh", "₹1 – 3 lakh", "₹3 – 6 lakh", "₹6 – 10 lakh", "Above ₹10 lakh"]);
  });
});
