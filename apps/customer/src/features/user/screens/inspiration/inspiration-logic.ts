/** Decisions from the web's inspiration-page.tsx (sample photos), kept out of the screen so they can be tested. */
import { INSPIRATION_CATEGORIES } from "@/features/user/data/planner";
import type { InspirationItem, InspirationShape } from "@/features/user/types/user.types";

export const INSPIRATION_FILTERS = [
  { value: "all", label: "All" },
  { value: "saved", label: "Saved" },
  ...INSPIRATION_CATEGORIES.map((c) => ({ value: c as string, label: c })),
];

/** Width over height for each shape (web aspect-[3/4], square, aspect-[4/3]). */
export const SHAPE_ASPECT: Record<InspirationShape, number> = { tall: 3 / 4, square: 1, wide: 4 / 3 };

/** All ideas, the saved ones, or one category's. */
export function inspirationItems(items: readonly InspirationItem[], filter: string, saved: readonly string[]): InspirationItem[] {
  return items.filter((i) => (filter === "all" ? true : filter === "saved" ? saved.includes(i.id) : i.category === filter));
}
