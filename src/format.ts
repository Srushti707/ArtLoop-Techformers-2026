/**
 * Formats a number as an Indian Rupee amount using Indian digit grouping.
 * e.g. 1500 -> "1,500", 12000 -> "12,000", 200000 -> "2,00,000"
 */
export function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN');
}

/**
 * Formats a number as an INR currency string with the ₹ symbol prefix.
 * e.g. 2000 -> "₹2,000"
 */
export function inr(amount: number): string {
  return `₹${formatINR(amount)}`;
}
