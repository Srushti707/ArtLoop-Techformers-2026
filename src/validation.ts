/**
 * Reusable budget validation for commission requests.
 * Enforces the artist's minimum commission price as a business rule.
 *
 * @param budgetInput - raw string from the form input
 * @param minPrice - the selected artist's numeric starting price in INR
 * @returns an error message string if invalid, or null if valid
 */
export function validateBudget(budgetInput: string, minPrice: number): string | null {
  if (!budgetInput || budgetInput.trim() === '') {
    return 'Please enter a budget.';
  }

  const budgetNum = parseFloat(budgetInput);

  if (isNaN(budgetNum)) {
    return 'Please enter a valid numeric budget.';
  }

  if (budgetNum <= 0) {
    return 'Budget must be greater than zero.';
  }

  if (budgetNum < minPrice) {
    return `Your budget must be at least ₹${minPrice.toLocaleString('en-IN')} for this artist.`;
  }

  return null;
}
