/** The web's route guards (features/user/routes/user-route-guards.tsx) for Expo Router. Decisions live in lib/auth-gate.ts. */
import { useEffect, useRef, type ReactNode } from "react";
import { Redirect, usePathname, useRouter } from "expo-router";
import { ErrorState, FullScreenLoader, LoadingState, Screen } from "@wedwizz/ui";
import { useCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { customerAreaRedirect, requireUserView } from "@/features/user/lib/auth-gate";
import { useCurrentPath } from "@/lib/current-path";

/** Where the signed-in customer must go instead of this page (profile setup), or null. */
function useProfileRedirect() {
  const { status } = useUserSession();
  const pathname = usePathname();
  const profile = useCustomerProfile({ enabled: status === "authenticated" });
  const hasProfile = profile.isSuccess ? profile.data.profile !== null : undefined;
  return { status, profile, redirect: customerAreaRedirect(pathname, status, hasProfile) };
}

/**
 * The web's CustomerArea, in the /user layout: a signed-in customer without a saved profile is sent to setup first and
 * comes back to this page afterwards; one with a profile never sees setup again. Pages show at once for guests.
 */
export function useCustomerAreaGate(): void {
  const router = useRouter();
  const here = useCurrentPath();
  const { redirect } = useProfileRedirect();
  const done = useRef<string | null>(null);

  useEffect(() => {
    // Once per page: the layout re-renders while the navigation runs.
    if (!redirect) {
      done.current = null;
      return;
    }
    const key = `${here}→${redirect}`;
    if (done.current === key) return;
    done.current = key;
    router.replace({ pathname: redirect as "/user/profile-setup", params: { from: here } });
  }, [redirect, here, router]);
}

/** Welcome and login: a signed-in customer goes straight to the app (web UserGuestOnly). */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useUserSession();
  if (status === "initializing") return <FullScreenLoader />;
  if (status === "authenticated") return <Redirect href="/user/home" />;
  return children;
}

/**
 * Customer-only screens (web RequireUser): a guest goes to welcome, coming back here after signing in; the screen
 * waits for the session and profile. `inLayout`: inside the tabs, so loading shows in the page, not full screen.
 */
export function RequireUser({ children, inLayout = false }: { children: ReactNode; inLayout?: boolean }) {
  const here = useCurrentPath();
  const { status, profile, redirect } = useProfileRedirect();

  switch (requireUserView(status, profile, redirect)) {
    case "loading":
      return inLayout ? (
        <Screen>
          <LoadingState />
        </Screen>
      ) : (
        <FullScreenLoader />
      );
    case "welcome":
      return <Redirect href={{ pathname: "/user/welcome", params: { from: here } }} />;
    case "error":
      return (
        <Screen>
          <ErrorState body="We couldn't load your profile. Please try again." onRetry={() => void profile.refetch()} />
        </Screen>
      );
    case "show":
      return children;
  }
}
