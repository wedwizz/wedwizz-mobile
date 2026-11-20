import { useMutation, useQuery, useQueryClient, type QueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { listFavourites, removeFavourite, saveFavourite } from "@/features/user/api/planner.api";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import type { Favourite } from "@wedwizz/core/api/types";
import { withFavourite } from "@wedwizz/core/planner/planner-cache";
import { favouriteKeys } from "@wedwizz/core/query/query-keys";

/** The signed-in customer's id, which their cached favourites and checklist are kept under. */
export function useAccountId(): string | null {
  return useUserSession().account?.accountId ?? null;
}

/** The customer's saved venues and vendors. Every heart reads this one cached list. */
export function useFavourites(options: { enabled?: boolean } = {}) {
  const accountId = useAccountId();
  return useQuery({
    queryKey: favouriteKeys.account(accountId),
    queryFn: ({ signal }) => listFavourites({ signal }),
    enabled: !!accountId && (options.enabled ?? true),
  });
}

/** Whether this listing is saved; undefined until the list has loaded, so a tap can't pick the wrong action. */
export function useIsFavourite(slug: string, options: { enabled?: boolean } = {}): boolean | undefined {
  const accountId = useAccountId();
  return useQuery({
    queryKey: favouriteKeys.account(accountId),
    queryFn: ({ signal }) => listFavourites({ signal }),
    select: (favourites) => favourites.some((f) => f.slug === slug),
    enabled: !!accountId && (options.enabled ?? true),
  }).data;
}

/**
 * Saves or removes one listing's favourite. The heart (and the Shortlisted page) change at once; a failure puts
 * the list back, and the server's list replaces the guess once the last pending change settles.
 *
 * Changes to the same listing share a scope, so save then remove reach the server in that order (other listings
 * still go in parallel). Each still shows at once (onMutate isn't queued).
 */
export function favouriteMutationOptions(
  queryClient: QueryClient,
  accountId: string | null,
  slug: string,
): UseMutationOptions<void, Error, { saved: boolean }, { previous: Favourite[] | undefined }> {
  const key = favouriteKeys.account(accountId);
  return {
    mutationKey: key,
    scope: { id: `favourite:${accountId}:${slug}` },
    mutationFn: async ({ saved }) => {
      if (saved) await saveFavourite(slug);
      else await removeFavourite(slug);
    },
    onMutate: async ({ saved }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Favourite[]>(key);
      // Not loaded yet: a list of just this one would pass for the customer's favourites, so leave it to the fetch.
      if (previous) queryClient.setQueryData<Favourite[]>(key, withFavourite(previous, slug, saved));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    // A refetch while other changes are pending would briefly bring back the server's older list.
    onSettled: () =>
      queryClient.isMutating({ mutationKey: key }) === 1
        ? queryClient.invalidateQueries({ queryKey: key })
        : undefined,
  };
}

export function useToggleFavourite(slug: string) {
  return useMutation(favouriteMutationOptions(useQueryClient(), useAccountId(), slug));
}
