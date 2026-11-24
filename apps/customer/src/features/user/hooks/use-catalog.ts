import { useEffect } from "react";
import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { checkAvailability, getCatalogProfile, listProfileReviews, recordProfileView, searchCatalog } from "@/features/user/api/catalog.api";
import { fetchBySlugs } from "@/features/user/lib/slug-batches";
import type { CatalogQuery } from "@wedwizz/core/api/types";
import { catalogKeys } from "@wedwizz/core/query/query-keys";
import { randomUUID } from "expo-crypto";
import { appStorage } from "@wedwizz/core/native/storage";
import { visitorId } from "@wedwizz/core/visitor/visitor-id";

// Approved listings change rarely; a minute keeps browsing snappy without hiding new approvals for long.
const STALE_MS = 60_000;

/** A search, page by page ("Load more"): each page's `nextCursor` asks for the next one. */
export function useCatalogSearch(query: CatalogQuery, options: { enabled?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: catalogKeys.search(query),
    queryFn: ({ pageParam, signal }) => searchCatalog({ ...query, ...(pageParam ? { cursor: pageParam } : {}) }, { signal }),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: STALE_MS,
    enabled: options.enabled ?? true,
  });
}

/** One page of results, e.g. for a home section or "Similar" rail. */
export function useCatalogList(query: CatalogQuery, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: catalogKeys.search({ ...query, single: true }),
    queryFn: ({ signal }) => searchCatalog(query, { signal }),
    staleTime: STALE_MS,
    enabled: options.enabled ?? true,
  });
}

/** Several one-page lists at once (Home's "From" prices), cached as useCatalogList caches them. */
export function useCatalogLists(queries: CatalogQuery[]) {
  return useQueries({
    queries: queries.map((query) => ({
      queryKey: catalogKeys.search({ ...query, single: true }),
      queryFn: ({ signal }: { signal: AbortSignal }) => searchCatalog(query, { signal }),
      staleTime: STALE_MS,
    })),
  });
}

/** "Check availability" for a date (and guests), once the customer asks; null until then. */
export function useAvailability(slug: string, query: { date: string; guests?: number } | null) {
  return useQuery({
    queryKey: catalogKeys.availability(slug, query ?? {}),
    queryFn: ({ signal }) => checkAvailability(slug, query!, { signal }),
    enabled: !!query,
    // A vendor can block a date at any time; an answer a little old is still worth showing, not trusting long.
    staleTime: 30_000,
    retry: false,
  });
}

/** One listing's public page. */
export function useCatalogProfile(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.profile(slug ?? ""),
    queryFn: ({ signal }) => getCatalogProfile(slug!, { signal }),
    enabled: !!slug,
    staleTime: STALE_MS,
  });
}

/**
 * Counts a view of the listing once its page has loaded (a missing listing isn't counted). The server keeps one
 * per visitor per day, so a repeat (a remount, a revisit) is harmless; a failure only loses that view.
 */
export function useRecordProfileView(slug: string | undefined, loaded: boolean) {
  useEffect(() => {
    if (!slug || !loaded) return;
    void visitorId(appStorage, randomUUID)
      .then((id) => recordProfileView(slug, id))
      .catch(() => undefined);
  }, [slug, loaded]);
}

/** A listing's reviews, page by page ("Show more"). */
export function useProfileReviews(slug: string | undefined) {
  return useInfiniteQuery({
    queryKey: catalogKeys.reviews(slug ?? ""),
    queryFn: ({ pageParam, signal }) => listProfileReviews(slug!, pageParam || undefined, { signal }),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!slug,
    staleTime: STALE_MS,
  });
}

/** Exactly these listings (favourites), in batches the API accepts. */
export function useCatalogBySlugs(slugs: string[]) {
  return useQuery({
    queryKey: catalogKeys.search({ slugs }),
    queryFn: ({ signal }) => fetchBySlugs(slugs, (batch) => searchCatalog({ slugs: batch }, { signal })),
    enabled: slugs.length > 0,
    staleTime: STALE_MS,
  });
}

/** "12 found", "12+ found" while more pages exist. */
export function resultCount(query: ReturnType<typeof useCatalogSearch>, noun: [string, string]): string | null {
  if (!query.data) return null;
  const count = query.data.pages.reduce((sum, page) => sum + page.items.length, 0);
  return `${count}${query.hasNextPage ? "+" : ""} ${count === 1 && !query.hasNextPage ? noun[0] : noun[1]} found`;
}
