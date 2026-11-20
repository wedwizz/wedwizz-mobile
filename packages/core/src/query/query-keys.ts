/**
 * Every query key in the app, built from these factories so invalidation never misses a typo'd key.
 * Add one factory per feature (e.g. `vendorKeys`, `venueKeys`) as their endpoints arrive.
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const vendorKeys = {
  all: ["vendor"] as const,
  profiles: () => [...vendorKeys.all, "profiles"] as const,
  profile: (profileId: string) => [...vendorKeys.profiles(), profileId] as const,
  onboardingOptions: () => [...vendorKeys.all, "onboarding-options"] as const,
  photos: (profileId: string) => [...vendorKeys.profile(profileId), "photos"] as const,
  proof: (profileId: string) => [...vendorKeys.profile(profileId), "proof"] as const,
  profileForm: (category: string) => [...vendorKeys.all, "profile-form", category] as const,
  contactChannels: (profileId: string) => [...vendorKeys.profile(profileId), "contact-channels"] as const,
  packages: (profileId: string) => [...vendorKeys.profile(profileId), "packages"] as const,
  blockedDateLists: () => [...vendorKeys.all, "blocked-dates"] as const,
  blockedDates: (query: object) => [...vendorKeys.blockedDateLists(), query] as const,
  stats: (query: object) => [...vendorKeys.all, "stats", query] as const,
};

export const catalogKeys = {
  all: ["catalog"] as const,
  searches: () => [...catalogKeys.all, "search"] as const,
  search: (query: object) => [...catalogKeys.searches(), query] as const,
  profile: (slug: string) => [...catalogKeys.all, "profile", slug] as const,
  reviews: (slug: string) => [...catalogKeys.profile(slug), "reviews"] as const,
  availability: (slug: string, query: object) => [...catalogKeys.profile(slug), "availability", query] as const,
};

export const customerKeys = {
  all: ["customer"] as const,
  profile: () => [...customerKeys.all, "profile"] as const,
};

// The customer's own lists, per account: a write that settles after sign-out can't land in the next account's.
export const favouriteKeys = {
  all: ["favourites"] as const,
  account: (accountId: string | null) => [...favouriteKeys.all, accountId] as const,
};

export const checklistKeys = {
  all: ["checklist"] as const,
  account: (accountId: string | null) => [...checklistKeys.all, accountId] as const,
};

export const enquiryKeys = {
  all: ["enquiries"] as const,
  lists: () => [...enquiryKeys.all, "list"] as const,
  list: (query: object) => [...enquiryKeys.lists(), query] as const,
  thread: (enquiryId: string) => [...enquiryKeys.all, "thread", enquiryId] as const,
};

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (query: object) => [...leadKeys.lists(), query] as const,
  thread: (enquiryId: string) => [...leadKeys.all, "thread", enquiryId] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  lists: () => [...adminKeys.all, "service-profiles"] as const,
  list: (query: object) => [...adminKeys.lists(), query] as const,
  detail: (profileId: string) => [...adminKeys.all, "service-profile", profileId] as const,
  changeRequests: (page: number) => [...adminKeys.all, "change-requests", page] as const,
  reviews: () => [...adminKeys.all, "reviews"] as const,
  reviewList: (query: object) => [...adminKeys.reviews(), query] as const,
};

export const bookingKeys = {
  all: ["bookings"] as const,
  customer: () => [...bookingKeys.all, "customer"] as const,
  vendorLists: () => [...bookingKeys.all, "vendor"] as const,
  vendor: (query: object) => [...bookingKeys.vendorLists(), query] as const,
};
