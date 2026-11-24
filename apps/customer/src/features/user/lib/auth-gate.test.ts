import { describe, expect, it } from "vitest";
import { customerAreaRedirect, guestTabTarget, paramString, requireUserView } from "./auth-gate";

// The web's route tests (features/user/routes/user-routes.test.tsx) for the guards, as decisions.
describe("customer routes for a guest", () => {
  it("opens home, the lists and business pages without signing in", () => {
    for (const path of ["/user/home", "/user/vendors", "/user/venues", "/user/vendors/lumen-stories-kochi"]) {
      expect(customerAreaRedirect(path, "unauthenticated", undefined)).toBeNull();
    }
  });

  it("sends a guest from their own screens to welcome", () => {
    expect(requireUserView("unauthenticated", { isPending: true, isError: false }, null)).toBe("welcome");
  });

  it("opens login from the Profile tab for a guest, coming back to the profile afterwards", () => {
    expect(guestTabTarget("profile", "unauthenticated")).toEqual({ pathname: "/user/login", params: { from: "/user/profile" } });
    expect(guestTabTarget("checklist", "unauthenticated")).toEqual({ pathname: "/user/login", params: { from: "/user/checklist" } });
  });

  it("opens the browsing tabs for a guest, and every tab once signed in or while the session loads", () => {
    expect(guestTabTarget("home", "unauthenticated")).toBeNull();
    expect(guestTabTarget("vendors", "unauthenticated")).toBeNull();
    expect(guestTabTarget("profile", "authenticated")).toBeNull();
    expect(guestTabTarget("profile", "initializing")).toBeNull();
  });
});

describe("customer routes when signed in", () => {
  it("sends a new customer from a business page to profile setup first", () => {
    expect(customerAreaRedirect("/user/vendors/lumen-stories-kochi", "authenticated", false)).toBe("/user/profile-setup");
  });

  it("lets a new customer read the legal pages before setup", () => {
    expect(customerAreaRedirect("/user/profile/terms", "authenticated", false)).toBeNull();
    expect(customerAreaRedirect("/user/profile/privacy", "authenticated", false)).toBeNull();
  });

  it("never shows setup again once the profile is saved", () => {
    expect(customerAreaRedirect("/user/profile-setup", "authenticated", true)).toBe("/user/home");
    expect(customerAreaRedirect("/user/favourites", "authenticated", true)).toBeNull();
  });

  it("leaves the sign-in screens alone, so the OTP screen can show 'Number verified' first", () => {
    for (const path of ["/user/verify-otp", "/user/login", "/user/welcome"]) {
      expect(customerAreaRedirect(path, "authenticated", false)).toBeNull();
    }
  });

  it("waits for the profile before deciding", () => {
    expect(customerAreaRedirect("/user/home", "authenticated", undefined)).toBeNull();
    expect(requireUserView("authenticated", { isPending: true, isError: false }, null)).toBe("loading");
  });

  it("offers a retry when the profile can't load, and shows the screen otherwise", () => {
    expect(requireUserView("authenticated", { isPending: false, isError: true }, null)).toBe("error");
    expect(requireUserView("authenticated", { isPending: false, isError: false }, null)).toBe("show");
  });

  it("keeps showing the loader while the setup redirect happens, so the screen never flashes", () => {
    expect(requireUserView("authenticated", { isPending: false, isError: false }, "/user/profile-setup")).toBe("loading");
  });

  it("waits while the session is restored", () => {
    expect(requireUserView("initializing", { isPending: true, isError: false }, null)).toBe("loading");
  });
});

describe("route params", () => {
  it("reads one string from a param", () => {
    expect(paramString("a")).toBe("a");
    expect(paramString(["a", "b"])).toBe("a");
    expect(paramString(undefined)).toBeUndefined();
  });
});
