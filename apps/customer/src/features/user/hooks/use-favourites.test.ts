import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { removeFavourite, saveFavourite } from "@/features/user/api/planner.api";
import { favouriteMutationOptions } from "@/features/user/hooks/use-favourites";
import { endSession } from "@wedwizz/core/auth/session-query";
import type { Favourite } from "@wedwizz/core/api/types";
import { favouriteKeys } from "@wedwizz/core/query/query-keys";

// Requests the test finishes by hand, to see which ones are on their way to the server.
const sent: { call: string; finish: () => void; fail: () => void }[] = [];
const request = (call: string) =>
  new Promise((resolve, reject) => sent.push({ call, finish: () => resolve(undefined), fail: () => reject(new Error("offline")) }));
vi.mock("@/features/user/api/planner.api", () => ({
  saveFavourite: vi.fn((slug: string) => request(`save ${slug}`)),
  removeFavourite: vi.fn((slug: string) => request(`remove ${slug}`)),
}));

const ANJALI = "acc-anjali";

function setup({ loaded = true } = {}) {
  const queryClient = new QueryClient();
  if (loaded) queryClient.setQueryData<Favourite[]>(favouriteKeys.account(ANJALI), []);
  const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();
  const heart = (slug: string, saved: boolean, accountId = ANJALI) =>
    new MutationObserver(queryClient, favouriteMutationOptions(queryClient, accountId, slug)).mutate({ saved });
  const savedSlugs = (accountId = ANJALI) => queryClient.getQueryData<Favourite[]>(favouriteKeys.account(accountId))?.map((f) => f.slug);
  return { queryClient, invalidate, heart, savedSlugs };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  sent.length = 0;
  vi.mocked(saveFavourite).mockClear();
  vi.mocked(removeFavourite).mockClear();
});

describe("heart changes", () => {
  it("reach the server in the order made for one listing, while other listings go in parallel", async () => {
    const { invalidate, heart, savedSlugs } = setup();
    const save = heart("lakeview-kochi", true);
    const remove = heart("lakeview-kochi", false);
    const other = heart("lumen-kochi", true);
    await flush();

    // Each shows at once; the remove waits for the save, the other listing doesn't.
    expect(savedSlugs()).toEqual(["lumen-kochi"]);
    expect(sent.map((s) => s.call)).toEqual(["save lakeview-kochi", "save lumen-kochi"]);

    sent[0].finish();
    await save;
    await flush();
    expect(sent.map((s) => s.call)).toEqual(["save lakeview-kochi", "save lumen-kochi", "remove lakeview-kochi"]);
    expect(invalidate).not.toHaveBeenCalled();

    sent[1].finish();
    await other;
    sent[2].finish();
    await remove;
    // Refetched once, after the last change.
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(savedSlugs()).toEqual(["lumen-kochi"]);
  });

  it("can't put one customer's list back into the next customer's after sign-out", async () => {
    const { queryClient, heart, savedSlugs } = setup();
    queryClient.setQueryData<Favourite[]>(favouriteKeys.account(ANJALI), [{ slug: "lumen-kochi", savedAt: "", listing: null }]);
    const save = heart("lakeview-kochi", true);
    await flush();

    // Anjali signs out with the save on its way; Priya signs in and loads hers.
    endSession(queryClient);
    queryClient.setQueryData<Favourite[]>(favouriteKeys.account("acc-priya"), []);
    sent[0].fail();
    await save.catch(() => undefined);

    expect(savedSlugs("acc-priya")).toEqual([]);
  });

  it("leave the list alone before it has loaded, so it can't pass for the customer's favourites", async () => {
    const { heart, savedSlugs } = setup({ loaded: false });
    const save = heart("lakeview-kochi", true);
    await flush();
    expect(sent.map((s) => s.call)).toEqual(["save lakeview-kochi"]);
    expect(savedSlugs()).toBeUndefined();
    sent[0].finish();
    await save;
  });
});
