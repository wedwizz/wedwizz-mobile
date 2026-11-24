import { useState } from "react";
import { SessionFavouriteButton } from "@/features/user/components/favourite-button";
import { INSPIRATION_ITEMS, inspirationImage } from "@/features/user/data/planner";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { useUserStore } from "@/features/user/store/user-store";
import type { InspirationItem } from "@/features/user/types/user.types";
import { INSPIRATION_FILTERS, SHAPE_ASPECT, inspirationItems } from "./inspiration-logic";
import { InspirationView } from "./inspiration-view";

/** Web inspiration-page.tsx. Open to guests; the ideas are samples and the hearts are saved on the phone only (as the web's session). */
export function InspirationScreen() {
  const goBack = useGoBack();
  const saved = useUserStore((s) => s.favourites.inspiration);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<InspirationItem | null>(null);

  return (
    <InspirationView
      onBack={goBack}
      filters={INSPIRATION_FILTERS}
      filter={filter}
      onFilter={setFilter}
      items={inspirationItems(INSPIRATION_ITEMS, filter, saved).map((item) => ({
        key: item.id,
        image: inspirationImage(item.seed, item.shape),
        alt: item.title,
        aspect: SHAPE_ASPECT[item.shape],
        onPress: () => setOpen(item),
        corner: <SessionFavouriteButton kind="inspiration" id={item.id} label={item.title} />,
      }))}
      onBrowseAll={() => setFilter("all")}
      open={
        open
          ? {
              title: open.title,
              category: open.category,
              image: inspirationImage(open.seed, open.shape, true),
              aspect: SHAPE_ASPECT[open.shape],
              heart: <SessionFavouriteButton kind="inspiration" id={open.id} label={open.title} diameter={44} />,
            }
          : null
      }
      onClose={() => setOpen(null)}
    />
  );
}
