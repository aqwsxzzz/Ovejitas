/**
 * Format a Date as the value a native `<input type="datetime-local">` expects:
 * local wall-clock "YYYY-MM-DDTHH:mm".
 *
 * Do NOT use `date.toISOString().slice(0, 16)` for this — that yields the UTC
 * wall-clock, which the input then treats as local, and on submit
 * `new Date(value).toISOString()` re-applies the offset, pushing the timestamp
 * hours into the future/past (breaks "today" report windows). Parsing back with
 * `new Date(value)` is correct because a datetime string with no timezone is
 * interpreted as local time.
 */
export function toDateTimeLocalValue(date: Date = new Date()): string {
	const offsetMs = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/**
 * Format a Date as a `date_from` / `date_to` query bound: bare "YYYY-MM-DD".
 *
 * The backend reads a bound with no timezone as the farm's own wall clock, and
 * rolls a bare `date_to` forward to the next farm-local midnight so the whole
 * day is covered. Send `toISOString()` instead and the bound carries an offset,
 * which the backend honours literally — the window then follows the browser's
 * calendar rather than the farm's, and today's events fall outside it.
 */
export function toDateParam(date: Date = new Date()): string {
	const offsetMs = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** `toDateParam` for a day offset from today (negative for the past). */
export function toDateParamOffsetDays(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return toDateParam(date);
}
