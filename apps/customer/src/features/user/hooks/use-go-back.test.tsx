// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGoBack } from "./use-go-back";

const router = vi.hoisted(() => ({ canGoBack: vi.fn(() => true), back: vi.fn(), replace: vi.fn() }));
vi.mock("expo-router", () => ({ useRouter: () => router }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useGoBack", () => {
  it("goes to the previous screen when there is one", () => {
    router.canGoBack.mockReturnValue(true);
    renderHook(() => useGoBack()).result.current();
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("replaces a screen opened from a shared link with Home", () => {
    router.canGoBack.mockReturnValue(false);
    renderHook(() => useGoBack()).result.current();
    expect(router.replace).toHaveBeenCalledWith("/user/home");
    expect(router.back).not.toHaveBeenCalled();
  });
});
