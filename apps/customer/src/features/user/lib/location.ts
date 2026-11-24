export const ALL_KERALA = "All Kerala";

export const KERALA_CITIES = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
] as const;

export const locationLabel = (location: string): string => (location === ALL_KERALA ? "Kerala" : location);

/** The city picker's search: cities whose name contains the words (any case), "All Kerala" first; all of them when empty. */
export function filterCities(query: string): string[] {
  const q = query.trim().toLowerCase();
  const all = [ALL_KERALA, ...KERALA_CITIES];
  return q ? all.filter((city) => city.toLowerCase().includes(q)) : all;
}
