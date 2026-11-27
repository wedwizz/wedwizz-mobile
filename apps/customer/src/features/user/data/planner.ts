import { photo } from "@/features/user/lib/images";
import type {
  InspirationCategory,
  InspirationItem,
  InspirationShape,
  InvitationTemplate,
} from "@/features/user/types/user.types";

export const CHECKLIST_CATEGORIES = ["Budget", "Venue", "Vendors", "Attire", "Guests", "Decor", "Legal", "Travel"] as const;

export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  { id: "blush-floral", name: "Blush Floral", cardClass: "bg-rose-50 border-rose-200", namesClass: "text-rose-700", textClass: "text-rose-900/75", dividerClass: "bg-rose-300" },
  { id: "royal-gold", name: "Royal Gold", cardClass: "bg-amber-50 border-amber-300", namesClass: "text-amber-800", textClass: "text-amber-900/75", dividerClass: "bg-amber-400" },
  { id: "emerald-garden", name: "Emerald Garden", cardClass: "bg-emerald-50 border-emerald-200", namesClass: "text-emerald-800", textClass: "text-emerald-900/75", dividerClass: "bg-emerald-300" },
  { id: "midnight-bloom", name: "Midnight Bloom", cardClass: "bg-slate-900 border-slate-700", namesClass: "text-amber-200", textClass: "text-slate-300", dividerClass: "bg-amber-300" },
  { id: "classic-ivory", name: "Classic Ivory", cardClass: "bg-stone-50 border-stone-300", namesClass: "text-stone-800", textClass: "text-stone-600", dividerClass: "bg-stone-400" },
  { id: "lavender-mist", name: "Lavender Mist", cardClass: "bg-violet-50 border-violet-200", namesClass: "text-violet-800", textClass: "text-violet-900/75", dividerClass: "bg-violet-300" },
];

export const INSPIRATION_CATEGORIES: InspirationCategory[] = [
  "Wedding Decor",
  "Bridal Makeup",
  "Wedding Photography",
  "Wedding Outfits",
  "Stage Decoration",
  "Floral Arrangements",
];

const SHAPES: InspirationShape[] = ["tall", "square", "wide", "tall", "square", "tall"];

export const INSPIRATION_ITEMS: InspirationItem[] = INSPIRATION_CATEGORIES.flatMap((category, ci) =>
  [0, 1, 2].map((n) => ({
    id: `insp-${ci}-${n}`,
    title: `${category} idea ${n + 1}`,
    category,
    seed: `insp-${ci}-${n}`,
    shape: SHAPES[(ci + n * 2) % SHAPES.length],
  })),
);

export const inspirationImage = (seed: string, shape: InspirationShape, large = false): string => {
  const scale = large ? 2 : 1;
  if (shape === "tall") return photo(seed, 450 * scale, 600 * scale);
  if (shape === "wide") return photo(seed, 600 * scale, 450 * scale);
  return photo(seed, 500 * scale, 500 * scale);
};
