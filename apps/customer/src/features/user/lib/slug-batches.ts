import type { CatalogPage } from "@wedwizz/core/api/types";

/** Most slugs one catalogue request accepts; keep in sync with the API's CATALOG_MAX_SLUGS. */
export const CATALOG_MAX_SLUGS = 50;

/**
 * Exactly these listings, however many: one request per batch of slugs, in parallel, merged in the order
 * asked. A slug lookup returns every requested public listing on one page, so there is no cursor to follow.
 */
export async function fetchBySlugs(
  slugs: readonly string[],
  fetchBatch: (batch: string[]) => Promise<CatalogPage>,
): Promise<CatalogPage> {
  const batches: string[][] = [];
  for (let i = 0; i < slugs.length; i += CATALOG_MAX_SLUGS) batches.push(slugs.slice(i, i + CATALOG_MAX_SLUGS));
  const pages = await Promise.all(batches.map(fetchBatch));
  return { items: pages.flatMap((page) => page.items), nextCursor: null };
}
