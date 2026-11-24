import { describe, expect, it } from "vitest";
import { ALL_KERALA, KERALA_CITIES, filterCities } from "./location";

describe("filterCities", () => {
  it("lists every city, All Kerala first, when nothing is typed", () => {
    expect(filterCities("  ")).toEqual([ALL_KERALA, ...KERALA_CITIES]);
  });

  it("matches part of a name in any case", () => {
    expect(filterCities("KOT")).toEqual(["Kottayam"]);
    expect(filterCities("kerala")).toEqual([ALL_KERALA]);
    expect(filterCities(" pu")).toEqual(["Thiruvananthapuram", "Alappuzha", "Malappuram"]);
  });

  it("finds nothing for an unknown place", () => {
    expect(filterCities("Chennai")).toEqual([]);
  });
});
