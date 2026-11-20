import { describe, expect, it } from "vitest";
import { CATALOG_MAX_SLUGS, fetchBySlugs } from "./slug-batches";
import type { CatalogCard, CatalogPage } from "@wedwizz/core/api/types";

const slugsOf = (count: number) => Array.from({ length: count }, (_, i) => `listing-${i + 1}`);

// A fake API: returns the requested slugs that are still public, as the server does.
function fakeApi(hidden: string[] = []) {
  const requests: string[][] = [];
  const fetchBatch = async (batch: string[]): Promise<CatalogPage> => {
    requests.push(batch);
    const items = batch.filter((slug) => !hidden.includes(slug)).map((slug) => ({ slug }) as CatalogCard);
    return { items, nextCursor: null };
  };
  return { requests, fetchBatch };
}

describe("fetchBySlugs", () => {
  it("asks once for up to the API's limit", async () => {
    const api = fakeApi();
    const page = await fetchBySlugs(slugsOf(CATALOG_MAX_SLUGS), api.fetchBatch);
    expect(api.requests).toHaveLength(1);
    expect(page.items).toHaveLength(CATALOG_MAX_SLUGS);
  });

  it("splits more slugs into batches the API accepts and keeps the saved order", async () => {
    const api = fakeApi(["listing-7", "listing-101"]);
    const slugs = slugsOf(120);
    const page = await fetchBySlugs(slugs, api.fetchBatch);

    expect(api.requests.map((batch) => batch.length)).toEqual([50, 50, 20]);
    expect(page).toEqual({
      items: slugs.filter((s) => s !== "listing-7" && s !== "listing-101").map((slug) => ({ slug })),
      nextCursor: null,
    });
  });

  it("asks nothing for no slugs", async () => {
    const api = fakeApi();
    expect(await fetchBySlugs([], api.fetchBatch)).toEqual({ items: [], nextCursor: null });
    expect(api.requests).toEqual([]);
  });
});
