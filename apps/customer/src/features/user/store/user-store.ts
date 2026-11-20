import { create } from "zustand";
import type { EnquiryDraft, SessionFavouriteKind } from "@/features/user/types/user.types";
import { loadCity, loadPoint, saveCity, savePoint, type GeoPoint } from "@wedwizz/core/geo/geo";
import { appStorage, visitStorage } from "@wedwizz/core/native/storage";

interface UserState {
  /** The chosen city (or All Kerala); remembered between visits. */
  location: string;
  /** "Near me": the device's position for this visit only, rounded to ~100 m. Never saved to the profile. */
  nearPoint: GeoPoint | null;
  /** Market and inspiration items (still samples). Saved venues and vendors are server data: useFavourites. */
  favourites: Record<SessionFavouriteKind, string[]>;
  recentlyViewed: string[];
  /** The message being written to a business (the compose sheet is open while set). */
  enquiryDraft: EnquiryDraft | null;
}

interface UserActions {
  setLocation: (location: string) => void;
  setNearPoint: (point: GeoPoint | null) => void;
  toggleFavourite: (kind: SessionFavouriteKind, id: string) => void;
  markViewed: (marketId: string) => void;
  openEnquiry: (draft: EnquiryDraft) => void;
  closeEnquiry: () => void;
  reset: () => void;
}

const initialState = (): UserState => ({
  location: loadCity(appStorage) ?? "Kochi",
  nearPoint: loadPoint(visitStorage),
  favourites: {
    market: [],
    inspiration: [],
  },
  recentlyViewed: [],
  enquiryDraft: null,
});

/**
 * Session-only state for the customer app (only the chosen city is remembered between visits, and the "near me"
 * point for the visit). Read it with a selector, e.g.
 * `useUserStore((s) => s.location)`, so a component re-renders only when its slice changes.
 *
 * Server data lives in TanStack Query hooks (useCustomerProfile, useEnquiries, useFavourites, useChecklist);
 * only UI state (location, the compose sheet) and the sample market and inspiration favourites stay here.
 */
export const useUserStore = create<UserState & UserActions>()((set) => ({
  ...initialState(),

  setLocation: (location) => {
    saveCity(appStorage, location);
    set({ location });
  },

  setNearPoint: (point) => {
    savePoint(visitStorage, point);
    set({ nearPoint: point });
  },

  toggleFavourite: (kind, id) =>
    set((s) => {
      const ids = s.favourites[kind];
      return {
        favourites: { ...s.favourites, [kind]: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] },
      };
    }),

  markViewed: (marketId) =>
    set((s) => ({ recentlyViewed: [marketId, ...s.recentlyViewed.filter((x) => x !== marketId)].slice(0, 6) })),

  openEnquiry: (enquiryDraft) => set({ enquiryDraft }),
  closeEnquiry: () => set({ enquiryDraft: null }),

  // Signing out forgets the position (the chosen city stays remembered).
  reset: () => {
    savePoint(visitStorage, null);
    set({ ...initialState(), nearPoint: null });
  },
}));
