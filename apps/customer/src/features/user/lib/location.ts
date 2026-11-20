export const ALL_KERALA = "All Kerala";

export const KERALA_CITIES = [
  "Kochi",
  "Kollam",
  "Thiruvananthapuram",
  "Kozhikode",
  "Thrissur",
  "Alappuzha",
  "Kottayam",
  "Kannur",
  "Palakkad",
] as const;

export const locationLabel = (location: string): string => (location === ALL_KERALA ? "Kerala" : location);
