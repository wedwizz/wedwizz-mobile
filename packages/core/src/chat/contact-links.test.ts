import { describe, expect, it } from "vitest";
import { callLink, whatsappLink } from "./contact-links";

describe("contact links", () => {
  it("opens WhatsApp with the Indian number and the prefilled message encoded", () => {
    expect(whatsappLink("9123456789", "Hi Lake View, is 14/02/2027 free? 400 guests & a quote")).toBe(
      "https://wa.me/919123456789?text=Hi%20Lake%20View%2C%20is%2014%2F02%2F2027%20free%3F%20400%20guests%20%26%20a%20quote",
    );
    expect(whatsappLink("9123456789", "")).toBe("https://wa.me/919123456789");
  });

  it("calls the Indian number", () => {
    expect(callLink("9123456789")).toBe("tel:+919123456789");
  });
});
