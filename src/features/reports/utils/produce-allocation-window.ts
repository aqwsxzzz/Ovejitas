import { toDateParam } from "@/lib/datetime";

/**
 * TEMPORARY WORKAROUND — remove once the backend rolls `date_to` consistently.
 *
 * `profitability_full` and `produce_outcome` bound their two halves differently.
 * Direct income/expense goes through `apply_date_range`, which rolls a midnight
 * `date_to` forward to the next farm-local midnight so the whole day counts.
 * The produce-allocation half (`income_by_producer_currency`, and the
 * `sold`/`income_total` side of `produce_outcome`) instead compares
 * `occurred_at > date_to` raw, with no roll.
 *
 * So on one request an animal's own income covers all of today while the money
 * its products earned is cut off at 00:00 — a sale made today shows the stock
 * leaving the pool and none of the revenue reaching the producer.
 *
 * Passing tomorrow as `date_to` restores the missing day. What it costs, and
 * why this is a patch and not a fix:
 *
 * - the window is genuinely one day wider, so "últimos 30 días" is 31, and any
 *   event dated in the future would leak in;
 * - it widens BOTH halves, so the direct-income half is now over-wide too;
 * - it only papers over today. The same off-by-one hits any `date_to` a farmer
 *   picks by hand, and no caller can know that from the outside.
 *
 * The real fix is one comparison in `produce_income.py` (and its twin in
 * `produce_outcome.py`) using the same whole-day rolling as `apply_date_range`.
 * Escalated to BE; applied here only to keep the demo honest about money that
 * the ledger has already attributed correctly.
 *
 * Do NOT reach for this anywhere else. `production-productivity` resolves its
 * own window onto whole calendar days and is already correct — widening it here
 * would make it expect an extra day of output.
 */
export function temporarilyExtendDateToForProduceAllocation(
	dateTo: string,
): string {
	const parsed = new Date(`${dateTo}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return dateTo;
	parsed.setDate(parsed.getDate() + 1);
	return toDateParam(parsed);
}
