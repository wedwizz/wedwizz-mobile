/** Formats a number as Indian Rupees, e.g. 65000 -> "₹65,000". */
export function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}
