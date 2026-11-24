import { describe, expect, it } from "vitest";
import { initialDetails, invitationDateLabel } from "./invitation-logic";

describe("initialDetails", () => {
  it("takes first names and the wedding date from the profile", () => {
    expect(initialDetails({ name: "Anu Thomas", partnerName: "Joel Mathew", weddingDate: "2027-02-14" })).toMatchObject({
      partnerOne: "Anu",
      partnerTwo: "Joel",
      date: "2027-02-14",
    });
  });

  it("falls back to the web's examples", () => {
    expect(initialDetails({ name: "Anu", partnerName: null, weddingDate: null })).toMatchObject({ partnerOne: "Anu", partnerTwo: "Rahul", date: "" });
    expect(initialDetails(undefined).partnerOne).toBe("Anjali");
  });
});

describe("invitationDateLabel", () => {
  it("writes the date out, or says it is to be announced", () => {
    expect(invitationDateLabel("")).toBe("Date to be announced");
    expect(invitationDateLabel("2027-02-14")).toMatch(/14.*February.*2027/);
  });
});
