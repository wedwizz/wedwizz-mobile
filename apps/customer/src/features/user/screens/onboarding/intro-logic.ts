/**
 * The intro slides follow the code screen for a new account, then profile setup (onboarding designs; not on the web,
 * where the code screen shows "Number verified" and Continue).
 */
import { returnPath } from "@/features/user/lib/return-path";

export type AfterVerify = { pathname: "/user/onboarding"; params: { from?: string } } | string;

/**
 * Where a correct code leads. A new account: the intro, keeping `from` for after setup. Anyone else: back to `from`
 * (the /user layout still sends a customer without a saved profile to setup first).
 */
export function afterVerify(isNewAccount: boolean, from: string | null | undefined): AfterVerify {
  if (isNewAccount) return { pathname: "/user/onboarding", params: from ? { from } : {} };
  return returnPath(from);
}
