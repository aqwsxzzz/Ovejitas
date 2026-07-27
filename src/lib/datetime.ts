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
