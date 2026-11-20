import { describe, expect, it } from "vitest";
import { enquiryMessage, needsGuestCount, suggestedEventDate, todayKey } from "@/features/user/lib/enquiry-templates";

describe("enquiry templates", () => {
  it("writes the venue availability message from the brief", () => {
    expect(enquiryMessage({ businessName: "Lake View", category: "VENUE", eventDate: "2026-10-29", guestCount: 400, kind: "availability" })).toBe(
      "Hi Lake View, I'm interested in booking your venue for my event on 29/10/2026 for 400 guests. Could you confirm availability and share more details along with a quotation?",
    );
  });

  it("words the request per category, and leaves out what is not known or not asked", () => {
    expect(enquiryMessage({ businessName: "Lumen", category: "PHOTOGRAPHY", eventDate: null, guestCount: null, kind: "message" })).toBe(
      "Hi Lumen, I'm interested in your photography services for my event. Could you share more details along with a quotation?",
    );
    // Guests only matter to venues and caterers; without a date there is no availability to confirm.
    expect(enquiryMessage({ businessName: "Glow", category: "MAKEUP", eventDate: null, guestCount: 300, kind: "availability" })).toBe(
      "Hi Glow, I'm interested in your bridal makeup services for my event. Could you share more details along with a quotation?",
    );
    expect(enquiryMessage({ businessName: "Feast", category: "CATERING", eventDate: "2027-02-14", guestCount: 250, kind: "message" })).toContain(
      "your catering services for my event on 14/02/2027 for 250 guests.",
    );
    expect(needsGuestCount("VENUE")).toBe(true);
    expect(needsGuestCount("CATERING")).toBe(true);
    expect(needsGuestCount("DJ")).toBe(false);
  });

  it("suggests the saved wedding date only while it is today or later", () => {
    const today = todayKey(new Date(2026, 9, 29, 23, 30));
    expect(today).toBe("2026-10-29");
    expect(suggestedEventDate("2027-02-14", today)).toBe("2027-02-14");
    expect(suggestedEventDate("2026-10-29", today)).toBe("2026-10-29");
    expect(suggestedEventDate("2026-10-28", today)).toBeNull();
    expect(suggestedEventDate(null, today)).toBeNull();
  });
});
