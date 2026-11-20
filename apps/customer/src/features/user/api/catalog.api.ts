import { apiClient } from "@wedwizz/core/api/api-client";
import type { ApiSuccess, Availability, CatalogDetail, CatalogPage, CatalogQuery, PublicReviewPage } from "@wedwizz/core/api/types";

interface RequestOptions {
  signal?: AbortSignal;
}

/** `GET /catalog/profiles`: public search (no sign-in), or exactly `slugs`. */
export async function searchCatalog(query: CatalogQuery, options: RequestOptions = {}): Promise<CatalogPage> {
  const { slugs, ...rest } = query;
  const { data } = await apiClient.get<ApiSuccess<CatalogPage>>("/catalog/profiles", {
    params: { ...rest, ...(slugs ? { slugs: slugs.join(",") } : {}) },
    signal: options.signal,
  });
  return data.data;
}

/** `GET /catalog/profiles/:slug/reviews`: visible reviews with the vendor's replies, newest first, a page at a time. */
export async function listProfileReviews(slug: string, cursor: string | undefined, options: RequestOptions = {}): Promise<PublicReviewPage> {
  const { data } = await apiClient.get<ApiSuccess<PublicReviewPage>>(`/catalog/profiles/${encodeURIComponent(slug)}/reviews`, {
    params: cursor ? { cursor } : {},
    signal: options.signal,
  });
  return data.data;
}

/**
 * `POST /catalog/profiles/:slug/views`: a view for the vendor's stats, counted once per visitor per day (by account
 * when signed in, else by this device's id) and never for the owner.
 */
export async function recordProfileView(slug: string, visitorId: string): Promise<void> {
  await apiClient.post(`/catalog/profiles/${encodeURIComponent(slug)}/views`, { visitorId });
}

/**
 * `GET /catalog/profiles/:slug/availability`: AVAILABLE, BLOCKED or UNKNOWN for a date (never why), plus a venue's
 * capacity. 400 for a past date.
 */
export async function checkAvailability(slug: string, query: { date: string; guests?: number }, options: RequestOptions = {}): Promise<Availability> {
  const { data } = await apiClient.get<ApiSuccess<Availability>>(`/catalog/profiles/${encodeURIComponent(slug)}/availability`, {
    params: query,
    signal: options.signal,
  });
  return data.data;
}

/** `GET /catalog/profiles/:slug`: one public listing; 404 when it is not (or no longer) public. */
export async function getCatalogProfile(slug: string, options: RequestOptions = {}): Promise<CatalogDetail> {
  const { data } = await apiClient.get<ApiSuccess<CatalogDetail>>(`/catalog/profiles/${encodeURIComponent(slug)}`, {
    signal: options.signal,
  });
  return data.data;
}
