import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { AuthAccount, MeData } from "@wedwizz/core/api/types";
import { endSession, loadSignedInAccount, meQuery, signOut } from "@wedwizz/core/auth/session-query";
import { useUserStore } from "@/features/user/store/user-store";

export type UserSessionStatus = "initializing" | "authenticated" | "unauthenticated";

interface UserSessionValue {
  status: UserSessionStatus;
  account: AuthAccount | null;
  /** Call after a successful OTP verification: loads the account from `/auth/me`. */
  completeSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

function toUserAccount(me: MeData | null): AuthAccount | null {
  // The customer app only signs in USER accounts; a vendor or admin session is not usable here.
  if (!me || me.account.role !== "USER") return null;

  const { accountId, phoneNumber, role } = me.account;
  return { accountId, phoneNumber, role };
}

/** Ends the session and resets the customer store, so the next customer on this device starts fresh. */
export function endUserSession(queryClient: QueryClient): void {
  endSession(queryClient);
  useUserStore.getState().reset();
}

/** The signed-in customer. Backed by the shared `/auth/me` query, restored from the refresh cookie on load. */
export function useUserSession(): UserSessionValue {
  const queryClient = useQueryClient();
  const { data: account, isPending } = useQuery({ ...meQuery, select: toUserAccount });

  const completeSignIn = useCallback(async () => {
    await loadSignedInAccount(queryClient);
  }, [queryClient]);

  const logout = useCallback(async () => {
    await signOut(queryClient);
    useUserStore.getState().reset();
  }, [queryClient]);

  return useMemo<UserSessionValue>(
    () => ({
      status: isPending ? "initializing" : account ? "authenticated" : "unauthenticated",
      account: account ?? null,
      completeSignIn,
      logout,
    }),
    [isPending, account, completeSignIn, logout],
  );
}
