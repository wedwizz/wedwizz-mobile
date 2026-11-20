import { useGlobalSearchParams, usePathname, useSegments } from "expo-router";

type Params = Record<string, string | string[] | undefined>;

/**
 * The current page as the web's `pathname + search` (e.g. "/user/vendors/lumen?photo=2"), used to come back to it
 * after login and to resume a pending action only on the page it was started on. Expo Router gives the path and one
 * bag of params that also holds the dynamic segments (`[slug]`), which are already in the path; only the rest form the
 * search, sorted so the same page always gives the same string.
 */
export function currentPath(pathname: string, segments: readonly string[], params: Params): string {
  const routeParams = new Set(segments.map((s) => /^\[(?:\.\.\.)?(.+)\]$/.exec(s)?.[1]).filter((name): name is string => !!name));
  const search = Object.keys(params)
    .filter((key) => !routeParams.has(key))
    .sort()
    .flatMap((key) => {
      const value = params[key];
      const values = Array.isArray(value) ? value : value === undefined ? [] : [value];
      return values.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
    })
    .join("&");
  return search ? `${pathname}?${search}` : pathname;
}

/** The current page (path and search), like the web's `${pathname}${search}`. */
export function useCurrentPath(): string {
  return currentPath(usePathname(), useSegments(), useGlobalSearchParams());
}
