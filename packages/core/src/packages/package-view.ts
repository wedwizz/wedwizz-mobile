import type { CatalogPackage, PackagePriceUnit } from "../api/types";
import { formatINR } from "../format";

/** Plain TS shared by the vendor's package screens and the public profile (and later the mobile app). */

export const PACKAGE_PRICE_UNITS: PackagePriceUnit[] = ["PER_EVENT", "PER_DAY", "PER_PLATE", "PER_HOUR"];

export const PRICE_UNIT_LABEL: Record<PackagePriceUnit, string> = {
  PER_EVENT: "per event",
  PER_DAY: "per day",
  PER_PLATE: "per plate",
  PER_HOUR: "per hour",
};

// The server's limits (domain/entity/service-package.ts).
export const PACKAGE_MAX = 10;
export const PACKAGE_NAME_MAX_LENGTH = 60;
export const PACKAGE_ITEMS_MAX = 15;
export const PACKAGE_ITEM_MAX_LENGTH = 80;
export const PACKAGE_PRICE_MAX = 100_000_000;

/** "₹65,000 per event". */
export function formatPackagePrice(pkg: Pick<CatalogPackage, "price" | "priceUnit">): string {
  return `${formatINR(pkg.price)} ${PRICE_UNIT_LABEL[pkg.priceUnit]}`;
}

/** The items typed one per line: trimmed, blank lines dropped, each once (ignoring case). */
export function itemsFromText(text: string): string[] {
  const seen = new Set<string>();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      const key = line.toLowerCase();
      if (!line || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** "Classic Wedding (copy)", kept within the name limit. */
export function copyName(name: string): string {
  const suffix = " (copy)";
  return `${name.slice(0, PACKAGE_NAME_MAX_LENGTH - suffix.length).trimEnd()}${suffix}`;
}

/** The ids in a new order, with the one at `index` moved by `delta` (-1 up, 1 down); null when it can't move. */
export function movedIds(ids: string[], index: number, delta: -1 | 1): string[] | null {
  const target = index + delta;
  if (index < 0 || index >= ids.length || target < 0 || target >= ids.length) return null;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
