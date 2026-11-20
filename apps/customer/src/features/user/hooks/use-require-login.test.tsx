// @vitest-environment jsdom
// Port of the web's use-require-login.test.tsx: the same cases, with Expo Router faked (the web used a memory router).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePendingAction, useRequireLogin } from "@/features/user/hooks/use-require-login";
import { apiClient, memoryRefreshTokenStore, saveRefreshToken, setAccessToken, setRefreshTokenStore } from "@wedwizz/core/api/api-client";
import type { MeData } from "@wedwizz/core/api/types";
import { PENDING_ACTION_KEY, PENDING_ACTION_TTL_MS, savePendingAction } from "@wedwizz/core/auth/pending-action";
import { appStorage } from "@wedwizz/core/native/storage";
import { authKeys } from "@wedwizz/core/query/query-keys";

/** The fake router's state: the current page, and where push() was asked to go. */
const nav = vi.hoisted(() => ({
  pathname: "",
  segments: [] as string[],
  params: {} as Record<string, string>,
  pushed: [] as unknown[],
}));

vi.mock("expo-router", () => {
  const router = { push: (href: unknown) => nav.pushed.push(href), replace: () => undefined, back: () => undefined, canGoBack: () => true };
  return {
    useRouter: () => router,
    usePathname: () => nav.pathname,
    useSegments: () => nav.segments,
    useGlobalSearchParams: () => nav.params,
  };
});

const SLUG = "lumen-stories-kochi";
const PAGE = `/user/vendors/${SLUG}?photo=2`;
const ME: MeData = { account: { accountId: "acc-anjali", phoneNumber: "9876543210", role: "USER", isActive: true, createdAt: "2026-11-01T00:00:00.000Z" } };

/** Sets the current page as Expo Router reports it (the vendor detail route is /user/vendors/[slug]). */
function goTo(path: string) {
  const [pathname, search = ""] = path.split("?");
  const parts = pathname.split("/").filter(Boolean);
  const isVendor = parts[1] === "vendors" && parts.length === 3;
  nav.pathname = pathname;
  nav.segments = isVendor ? ["user", "vendors", "[slug]"] : parts;
  nav.params = { ...(isVendor ? { slug: parts[2] } : {}), ...Object.fromEntries(new URLSearchParams(search)) };
}

const run = vi.fn();
const resumed = vi.fn();
const originalAdapter = apiClient.defaults.adapter;

function Probe() {
  const requireLogin = useRequireLogin();
  usePendingAction("favourite", SLUG, true, resumed);
  return (
    <button type="button" onClick={() => requireLogin({ type: "favourite", slug: SLUG }, run)}>
      Save
    </button>
  );
}

/** `session`: the customer signed in, a guest (null), or still being restored ("loading"). */
async function renderProbe(session: MeData | null | "loading", path = PAGE) {
  goTo(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  if (session === "loading") {
    // A stored token whose refresh never answers.
    await saveRefreshToken("refresh-1");
    apiClient.defaults.adapter = () => new Promise(() => {});
  } else {
    queryClient.setQueryData(authKeys.me(), session);
  }
  const ui = () => (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Probe />
      </QueryClientProvider>
    </StrictMode>
  );
  const { rerender } = render(ui());
  /** Navigates (the probe's screen stays mounted under the next one, as in a stack) and re-renders. */
  const navigate = (to: string) => {
    goTo(to);
    rerender(ui());
  };
  return { queryClient, navigate };
}

beforeEach(() => {
  appStorage.removeItem(PENDING_ACTION_KEY);
  setRefreshTokenStore(memoryRefreshTokenStore());
  setAccessToken(null);
  nav.pushed = [];
  run.mockClear();
  resumed.mockClear();
});
afterEach(() => {
  cleanup();
  apiClient.defaults.adapter = originalAdapter;
});

describe("useRequireLogin", () => {
  it("runs the action at once for a signed-in customer", async () => {
    await renderProbe(ME);
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(run).toHaveBeenCalledTimes(1);
    expect(nav.pushed).toEqual([]);
    expect(appStorage.getItem(PENDING_ACTION_KEY)).toBeNull();
  });

  it("remembers a guest's action and opens login, coming back to this page and search", async () => {
    await renderProbe(null);
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(run).not.toHaveBeenCalled();
    expect(nav.pushed).toEqual([{ pathname: "/user/login", params: { from: PAGE } }]);
    expect(JSON.parse(appStorage.getItem(PENDING_ACTION_KEY) ?? "null")).toMatchObject({ type: "favourite", slug: SLUG, from: PAGE });
  });

  it("does nothing while the session is still being restored", async () => {
    await renderProbe("loading");
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(run).not.toHaveBeenCalled();
    expect(nav.pushed).toEqual([]);
  });
});

describe("usePendingAction", () => {
  it("finishes the action once after logging in, back on the page it was started on", async () => {
    const { queryClient, navigate } = await renderProbe(null);
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(resumed).not.toHaveBeenCalled();

    // On the login screen: signed in (OTP verified), not yet back.
    act(() => navigate("/user/login"));
    act(() => queryClient.setQueryData(authKeys.me(), ME));
    expect(resumed).not.toHaveBeenCalled();

    // Back where the visitor was.
    act(() => navigate(PAGE));
    expect(resumed).toHaveBeenCalledTimes(1);
    expect(resumed.mock.calls[0][0]).toMatchObject({ type: "favourite", slug: SLUG });

    // Later visits to the page don't run it again.
    act(() => navigate("/user/vendors/other-kochi"));
    act(() => navigate(PAGE));
    expect(resumed).toHaveBeenCalledTimes(1);
  });

  it("doesn't run on another page than the one it was started on", async () => {
    savePendingAction(appStorage, { type: "favourite", slug: SLUG, from: "/user/vendors/lumen-stories-kochi", savedAt: Date.now() });
    await renderProbe(ME, PAGE);
    expect(resumed).not.toHaveBeenCalled();
  });

  it("ignores an action older than 10 minutes", async () => {
    savePendingAction(appStorage, { type: "favourite", slug: SLUG, from: PAGE, savedAt: Date.now() - PENDING_ACTION_TTL_MS - 1000 });
    await renderProbe(ME);
    expect(resumed).not.toHaveBeenCalled();
    expect(appStorage.getItem(PENDING_ACTION_KEY)).toBeNull();
  });

  it("doesn't run for a guest", async () => {
    savePendingAction(appStorage, { type: "favourite", slug: SLUG, from: PAGE, savedAt: Date.now() });
    await renderProbe(null);
    expect(resumed).not.toHaveBeenCalled();
    expect(appStorage.getItem(PENDING_ACTION_KEY)).not.toBeNull();
  });
});
