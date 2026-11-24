import type { IntroSlide } from "@wedwizz/ui";

/**
 * The intro slides (onboarding designs). Slides 2 and 3 are the designs' words; slide 1 wasn't in the screenshots, so its
 * words come from the web welcome page. Photos: assets/images/onboarding-1…3.jpg (supplied 2026-11-23).
 */
export const INTRO_SLIDES: IntroSlide[] = [
  {
    key: "discover",
    image: require("@/assets/images/onboarding-1.jpg") as number,
    alt: "A wedding aisle lined with roses and lanterns, leading to a flower arch",
    kicker: "Made for Kerala weddings",
    title: "Everything you need for your perfect wedding",
    body: "Discover venues, photographers, makeup artists and more across Kerala.",
  },
  {
    key: "chat",
    image: require("@/assets/images/onboarding-2.jpg") as number,
    alt: "A photographer shooting a couple, beside a bridal gown and a camera",
    kicker: "Made for Kerala weddings",
    title: "Chat with trusted vendors",
    body: "Meet verified local experts and keep every conversation in one calm place.",
  },
  {
    key: "checklist",
    image: require("@/assets/images/onboarding-3.jpg") as number,
    alt: "A phone showing a wedding checklist, with venue photos, roses and rings",
    kicker: "Made for Kerala weddings",
    title: "Stay on track with your checklist",
    body: "Plan every detail together, from the first shortlist to the final booking.",
  },
];
