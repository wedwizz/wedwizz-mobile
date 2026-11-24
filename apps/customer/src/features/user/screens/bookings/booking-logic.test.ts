import { describe, expect, it } from "vitest";
import { cancelLabel, cancelSheetBody, reviewError } from "./booking-logic";

describe("cancelling", () => {
  it("cancels a confirmed booking and withdraws a request", () => {
    expect(cancelLabel("CONFIRMED")).toBe("Cancel booking");
    expect(cancelLabel("PENDING")).toBe("Withdraw");
    expect(cancelSheetBody("CONFIRMED", "Lumen")).toBe("Lumen will see that you cancelled. This cannot be undone.");
    expect(cancelSheetBody("PENDING", "Lumen")).toBe("Your request to confirm this booking will be withdrawn.");
  });
});

describe("reviewError", () => {
  it("needs a rating first, then 10 characters", () => {
    expect(reviewError(0, "Wonderful food and service")).toBe("Choose a rating from 1 to 5 stars.");
    expect(reviewError(5, "  Great!   ")).toBe("Write at least 10 characters.");
    expect(reviewError(4, "Great food, on time")).toBe("");
  });
});
