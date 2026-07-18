/**
 * Sticky "last-used" currency, persisted per farm so monetary forms reopen with
 * the currency the user last picked. Stored by ISO code (stable across farms),
 * resolved back to a `currency_id` against the farm's currency list.
 */
const storageKey = (farmId: string): string =>
	`ovejitas:last-currency:${farmId}`;

export const readLastCurrencyCode = (farmId: string): string | null => {
	try {
		return localStorage.getItem(storageKey(farmId));
	} catch {
		return null;
	}
};

export const rememberLastCurrencyCode = (
	farmId: string,
	code: string,
): void => {
	try {
		localStorage.setItem(storageKey(farmId), code);
	} catch {
		// Ignore storage failures (private mode / disabled) — a non-sticky
		// default is an acceptable degradation.
	}
};
