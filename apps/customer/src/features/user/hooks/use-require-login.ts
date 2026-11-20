import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { useCurrentPath } from "@/lib/current-path";
import { savePendingAction, takePendingAction, type PendingAction, type PendingActionType } from "@wedwizz/core/auth/pending-action";
import { appStorage } from "@wedwizz/core/native/storage";

export type LoginGatedAction = Pick<PendingAction, "type" | "slug" | "draft">;

/**
 * The one gate for actions that need an account (save, message, WhatsApp, call, enquire). Signed in, the action runs
 * at once. Signed out, it is remembered and the visitor goes to login, coming back to this page (path and search)
 * afterwards, where `usePendingAction` finishes it. While the session is still loading a tap does nothing, so a
 * signed-in customer is never sent to login by mistake.
 * (Web: router state `{ from }`; here the login screen gets `from` as a param.)
 */
export function useRequireLogin() {
  const { status } = useUserSession();
  const router = useRouter();
  const from = useCurrentPath();

  return useCallback(
    (action: LoginGatedAction, run: () => void) => {
      if (status === "initializing") return;
      if (status === "authenticated") return run();
      savePendingAction(appStorage, { ...action, from, savedAt: Date.now() });
      router.push({ pathname: "/user/login", params: { from } });
    },
    [status, from, router],
  );
}

/**
 * Finishes an action started before logging in: once signed in, back on the page it was started on, and `ready`
 * (e.g. the saved state is known), `onResume` runs once with it.
 */
export function usePendingAction(type: PendingActionType, slug: string | undefined, ready: boolean, onResume: (action: PendingAction) => void) {
  const { status } = useUserSession();
  const path = useCurrentPath();
  const latest = useRef(onResume);
  useEffect(() => {
    latest.current = onResume;
  });

  useEffect(() => {
    if (status !== "authenticated" || !ready || !slug) return;
    // Taking it removes it: it runs once, even if this effect runs twice.
    const action = takePendingAction(appStorage, { type, slug, path });
    if (action) latest.current(action);
  }, [status, ready, slug, type, path]);
}
