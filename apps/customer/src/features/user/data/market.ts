import { photo } from "@/features/user/lib/images";
import type { MarketCategoryKey, MarketItem } from "@/features/user/types/user.types";

function item(
  id: string,
  name: string,
  category: MarketCategoryKey,
  price: number,
  originalPrice: number | undefined,
  description: string,
  includes: string[],
): MarketItem {
  return {
    id,
    name,
    category,
    price,
    originalPrice,
    images: ["a", "b", "c"].map((s) => photo(`mk-${id}-${s}`, 800, 700)),
    description: `${description} Sample listing for demonstration; prices and availability are not real.`,
    includes,
  };
}

export const MARKET_ITEMS: MarketItem[] = [
  item("haldi-kit", "Haldi & Mehndi Ceremony Kit", "essentials", 3499, 4499, "Everything for a joyful haldi and mehndi function.", ["Haldi bowls & turmeric paste", "Marigold garlands", "Mehndi cones (24)", "Ceremony tray set"]),
  item("pooja-essentials", "Wedding Pooja Essentials", "essentials", 2199, undefined, "A complete traditional pooja set for the wedding day.", ["Brass lamp set", "Kalasam set", "Incense & camphor", "Pooja thali"]),
  item("welcome-hamper", "Guest Welcome Hamper", "essentials", 899, 1199, "Thoughtful welcome gifts for outstation guests.", ["Local snacks", "Scented candle", "Itinerary card", "Reusable tote"]),
  item("laser-cards", "Laser-cut Invitation Suite (100)", "invitations", 9500, 12000, "Elegant laser-cut cards with matching envelopes.", ["100 invitation cards", "Envelopes", "Design proof", "Matching tags"]),
  item("return-gifts", "Return Gift Box Set (50)", "invitations", 12500, undefined, "Curated return gifts packed in branded boxes.", ["50 gift boxes", "Custom message card", "Assorted sweets", "Ribbon packing"]),
  item("save-date-video", "Animated Save-the-Date Video", "invitations", 2999, 3999, "A short animated video invite for sharing online.", ["30-second animation", "Custom music", "2 revisions", "HD export"]),
  item("mandap-package", "Floral Mandap Decor Package", "decor", 85000, 99000, "A complete floral mandap with stage lighting.", ["Mandap structure", "Fresh floral styling", "Stage lighting", "Setup & teardown"]),
  item("entrance-arch", "Entrance Arch & Pathway", "decor", 32000, undefined, "A welcoming floral arch with aisle styling.", ["Floral arch", "Aisle runner", "Pathway lanterns", "On-site team"]),
  item("reception-stage", "Reception Stage Setup", "decor", 56000, 64000, "A statement stage backdrop for the reception.", ["Backdrop design", "Sofa seating", "LED panel", "Floral accents"]),
  item("candid-day", "Candid Wedding Day Package", "photography", 55000, 68000, "Full-day candid coverage of the wedding.", ["8 hours coverage", "2 photographers", "300 edited photos", "Online gallery"]),
  item("prewedding-shoot", "Pre-wedding Shoot Package", "photography", 28000, undefined, "A relaxed outdoor shoot with styled looks.", ["Half-day shoot", "2 outfit changes", "50 edited photos", "Short reel"]),
  item("bridal-glam", "Bridal Glam Package", "bridal", 22000, 26000, "Complete bridal makeup and hair for the wedding day.", ["HD bridal makeup", "Hairstyling", "Saree draping", "Touch-up kit"]),
  item("mehndi-bride", "Bridal Mehndi Package", "bridal", 7500, undefined, "Intricate bridal mehndi for hands and feet.", ["Full hands & feet", "Natural henna", "Aftercare guide", "2 guest designs"]),
  item("bridesmaid-pack", "Bridesmaid Styling Pack", "bridal", 9800, 12500, "Matching styling for the bridal party.", ["4 makeup sessions", "Hairstyling", "Draping help", "Group photos prep"]),
];

export const discountPercent = (marketItem: MarketItem): number =>
  marketItem.originalPrice ? Math.round((1 - marketItem.price / marketItem.originalPrice) * 100) : 0;
