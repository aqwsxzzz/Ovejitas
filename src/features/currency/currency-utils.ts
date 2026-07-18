/**
 * Resolves an event's `currency_id` to its ISO display code. Returns an empty
 * string when the currency is absent (non-monetary event) or not yet loaded, so
 * callers can render `amount + code` without extra guards.
 */
export const getCurrencyCode = (
	currencyById: Map<number, string> | undefined,
	currencyId: number | null,
): string => (currencyId != null ? (currencyById?.get(currencyId) ?? "") : "");
