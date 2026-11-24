import { HeartButton } from "@wedwizz/ui";
import { useIsFavourite, useToggleFavourite } from "@/features/user/hooks/use-favourites";
import { usePendingAction, useRequireLogin } from "@/features/user/hooks/use-require-login";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { useUserStore } from "@/features/user/store/user-store";
import type { SessionFavouriteKind } from "@/features/user/types/user.types";

interface FavouriteButtonProps {
  /** The listing's slug. */
  id: string;
  label: string;
  /** 36 on cards; 44 in a detail page's header. */
  diameter?: number;
}

/**
 * The heart on a venue or vendor (web FavouriteButton → ListingHeart, same logic). Saved to the customer's account;
 * a guest's tap goes to login and the listing is saved on coming back. Market and inspiration hearts: SessionFavouriteButton below.
 */
export function FavouriteButton({ id, label, diameter }: FavouriteButtonProps) {
  const requireLogin = useRequireLogin();
  const { status } = useUserSession();
  // Until the session is known, a tap could send a signed-in customer to login.
  const initializing = status === "initializing";
  const signedIn = status === "authenticated";
  const saved = useIsFavourite(id, { enabled: signedIn });
  const toggle = useToggleFavourite(id);
  // Signed in, the tap saves or removes, so it waits until the saved state is known.
  const disabled = initializing || (signedIn && saved === undefined);

  // Tapped while signed out: saved once back here after logging in (unless it already was).
  usePendingAction("favourite", id, saved !== undefined, () => {
    if (!saved) toggle.mutate({ saved: true });
  });

  const onPress = () => {
    if (disabled) return;
    requireLogin({ type: "favourite", slug: id }, () => toggle.mutate({ saved: !saved }));
  };
  return <HeartButton active={saved ?? false} label={label} disabled={disabled} onPress={onPress} diameter={diameter} />;
}

/** The heart on a market or inspiration item (web SessionHeart): still sample items, saved on this phone only. */
export function SessionFavouriteButton({ kind, id, label, diameter }: { kind: SessionFavouriteKind; id: string; label: string; diameter?: number }) {
  const active = useUserStore((s) => s.favourites[kind].includes(id));
  const toggleFavourite = useUserStore((s) => s.toggleFavourite);
  return <HeartButton active={active} label={label} onPress={() => toggleFavourite(kind, id)} diameter={diameter} />;
}
