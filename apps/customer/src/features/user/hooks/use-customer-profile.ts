import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerProfile, saveCustomerProfile } from "@/features/user/api/customer-profile.api";
import { useAccountId } from "@/features/user/hooks/use-favourites";
import type { SaveCustomerProfilePayload } from "@wedwizz/core/api/types";
import { checklistKeys, customerKeys } from "@wedwizz/core/query/query-keys";

/**
 * The signed-in customer's profile. Only this customer changes it, so it is never refetched on its
 * own; saving writes the cache, and signing out drops it. Never asked for without a customer account
 * (a guest browsing the catalogue).
 */
export function useCustomerProfile(options: { enabled?: boolean } = {}) {
  const accountId = useAccountId();
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: ({ signal }) => getCustomerProfile({ signal }),
    staleTime: Infinity,
    enabled: !!accountId && (options.enabled ?? true),
  });
}

export function useSaveCustomerProfile() {
  const queryClient = useQueryClient();
  const accountId = useAccountId();
  return useMutation({
    mutationFn: (payload: SaveCustomerProfilePayload) => saveCustomerProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(customerKeys.profile(), data);
      // Checklist due dates follow the wedding date.
      void queryClient.invalidateQueries({ queryKey: checklistKeys.account(accountId) });
    },
  });
}
